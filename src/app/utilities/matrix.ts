import {
  Step,
  Entities,
  RationalRecipe,
  RecipeId,
  RationalItem,
  ItemId,
  Rational,
  Solver,
  Variable,
  Expression,
  Constraint,
  Strength,
  Operator,
} from '~/models';
import { RationalDataset } from '~/store/dataset';
import { ItemsState } from '~/store/items';
import { RecipesState } from '~/store/recipes';
import { RateUtility } from './rate';

export class MatrixUtility {
  static solveMatricesFor(
    steps: Step[],
    itemSettings: ItemsState,
    recipeSettings: RecipesState,
    fuel: ItemId,
    oilRecipe: RecipeId,
    data: RationalDataset
  ) {
    const matrix = new MatrixSolver(
      steps,
      itemSettings,
      recipeSettings,
      fuel,
      oilRecipe,
      data
    );
    if (matrix.simpleStepsOnly) {
      return steps;
    }

    matrix.calculateRecipes();

    if (matrix.simpleRecipesOnly) {
      // No matrix steps found
      return steps;
    }

    matrix.solve();

    return matrix.steps;
  }
}

export class MatrixSolver {
  steps: Step[];
  itemSettings: ItemsState;
  recipeSettings: RecipesState;
  fuel: ItemId;
  oilRecipe: RecipeId;
  data: RationalDataset;

  disabled: Entities<boolean> = {};
  value: Entities<Rational> = {};
  recipes: Entities<RationalRecipe> = {};
  recipeIds: RecipeId[] = [];
  usedRecipeIds: RecipeId[] = [];
  mappedRecipeIds: RecipeId[] = [];
  recipeVar: Entities<Variable> = {};
  items: Entities<RationalItem> = {};
  itemIds: ItemId[] = [];
  outputs: ItemId[] = [];
  surplusVar: Entities<Variable> = {};
  inputVar: Entities<Variable> = {};

  solver = new Solver();

  constructor(
    steps: Step[],
    itemSettings: ItemsState,
    recipeSettings: RecipesState,
    fuel: ItemId,
    oilRecipe: RecipeId,
    data: RationalDataset
  ) {
    this.steps = steps;
    this.itemSettings = itemSettings;
    this.recipeSettings = recipeSettings;
    this.fuel = fuel;
    this.oilRecipe = oilRecipe;
    this.data = data;
  }

  get simpleStepsOnly() {
    return !this.steps.some(
      (s) =>
        s.recipeId !== (s.itemId as string) &&
        !this.itemSettings[s.itemId].ignore
    );
  }

  get simpleRecipesOnly() {
    return (
      Object.keys(this.value).length === 0 ||
      Object.keys(this.value).every((v) => this.value[v].isZero())
    );
  }

  solve() {
    this.parseRecipes();
    this.parseItems();
    this.parseCost();
    this.solver.updateVariables();
    this.parseSolutionRecipes();
    this.parseSolutionOutputs();
    this.parseSolutionSteps();
    this.parseSolutionInputs();
  }

  parseRecipes() {
    for (const r of this.recipeIds) {
      const variable = new Variable();
      this.solver.addEditVariable(variable, Strength.weak);
      this.solver.addConstraint(
        new Constraint(new Expression(variable), Operator.Ge)
      );

      const recipe = this.data.recipeR[r];
      if (recipe.in) {
        for (const inId of Object.keys(recipe.in)) {
          this.items[inId] = this.data.itemR[inId];
        }
      }
      for (const outId of Object.keys(recipe.out)) {
        this.items[outId] = this.data.itemR[outId];
        if (!this.outputs.some((o) => o === outId)) {
          this.outputs.push(outId as ItemId);
        }
      }
      this.recipeVar[r] = variable;
    }

    this.itemIds = Object.keys(this.items) as ItemId[];
  }

  parseItems() {
    for (const i of this.itemIds) {
      const surplus = new Variable();
      this.solver.addEditVariable(surplus, Strength.weak);
      this.solver.addConstraint(
        new Constraint(new Expression(surplus), Operator.Ge)
      );

      let expr = new Expression([Rational.minusOne, surplus]);
      if (this.value[i]) {
        expr = expr.minus(this.value[i]);
      }
      for (const r of this.recipeIds) {
        const recipe = this.data.recipeR[r];
        const rVar = this.recipeVar[r];
        if (recipe.in) {
          for (const inId of Object.keys(recipe.in).filter((id) => i === id)) {
            expr = expr.minus(new Expression([recipe.in[inId], rVar]));
          }
        }
        for (const outId of Object.keys(recipe.out).filter((id) => i === id)) {
          expr = expr.plus(new Expression([recipe.out[outId], rVar]));
        }
      }

      if (!this.outputs.some((o) => o === i)) {
        // Input only
        const inVariable = new Variable();
        this.solver.addEditVariable(inVariable, Strength.weak);
        expr = expr.plus(new Expression(inVariable));
        this.inputVar[i] = inVariable;
      }

      this.solver.addConstraint(new Constraint(expr, Operator.Eq));
      this.surplusVar[i] = surplus;
    }
  }

  parseCost() {
    const tax = new Variable();
    const cost = new Variable();
    this.solver.addEditVariable(tax, Strength.weak);
    this.solver.addEditVariable(cost, Strength.weak);

    let factoryExpr = new Expression(tax);
    for (const r of this.recipeIds) {
      factoryExpr = factoryExpr.minus(this.recipeVar[r]);
    }
    let costExpr = new Expression(cost);
    for (const i of Object.keys(this.inputVar)) {
      if (this.data.recipeR[i]) {
        if (this.data.recipeR[i].producers[0] === ItemId.OffshorePump) {
          costExpr = costExpr.minus(
            new Expression([Rational.hundred, this.inputVar[i]])
          );
        } else {
          costExpr = costExpr.minus(
            new Expression([new Rational(BigInt(10000)), this.inputVar[i]])
          );
        }
      } else {
        costExpr = costExpr.minus(
          new Expression([Rational.thousand, this.inputVar[i]])
        );
      }
    }

    this.solver.addConstraint(new Constraint(factoryExpr, Operator.Eq));
    this.solver.addConstraint(new Constraint(costExpr, Operator.Eq));
    this.solver.suggestValue(cost, Rational.zero);
  }

  parseSolutionRecipes() {
    this.usedRecipeIds = Object.keys(this.recipeVar).filter((r) => {
      return this.recipeVar[r].value().gt(Rational.zero);
    }) as RecipeId[];
  }

  parseSolutionOutputs() {
    for (const i of this.outputs) {
      const surplusVal = this.surplusVar[i].value();
      let itemOutput = Rational.zero;
      for (const r of Object.keys(this.recipeVar)) {
        if (this.data.recipeR[r].out[i]) {
          const test = this.data.recipeR[r].out[i];
          itemOutput = itemOutput.add(
            this.data.recipeR[r].out[i].mul(this.recipeVar[r].value())
          );
        }
      }
      if (itemOutput.gt(Rational.zero)) {
        let step = this.steps.find((s) => s.itemId === i);
        const matches = this.usedRecipeIds.filter(
          (r) =>
            !this.mappedRecipeIds.some((m) => m === r) &&
            this.data.recipeR[r].out[i]
        );
        const recipeId = matches.length ? matches[0] : null;
        if (step) {
          if (this.value[i]) {
            step.items = itemOutput;
          } else {
            step.items = step.items.add(itemOutput);
          }
        } else {
          step = {
            itemId: i,
            items: itemOutput,
          };
          this.steps.push(step);
        }
        if (recipeId) {
          step.recipeId = recipeId as RecipeId;
          step.factories = this.recipeVar[recipeId]
            .value()
            .mul(this.data.recipeR[recipeId].time);
          this.mappedRecipeIds.push(recipeId);
        }
        if (surplusVal.gt(Rational.zero)) {
          step.surplus = surplusVal;
          step.items = step.items.sub(surplusVal);
        }
      }
    }
  }

  parseSolutionSteps() {
    for (const r of this.usedRecipeIds.filter(
      (i) => !this.mappedRecipeIds.some((m) => m === i)
    )) {
      this.steps.push({
        itemId: null,
        items: null,
        recipeId: r as RecipeId,
        factories: this.recipeVar[r].value().mul(this.data.recipeR[r].time),
      });
    }
  }

  parseSolutionInputs() {
    for (const i of Object.keys(this.inputVar).filter((id) =>
      this.inputVar[id].value().nonzero()
    )) {
      // Item has simple recipe, calculate inputs
      RateUtility.addStepsFor(
        null,
        i as ItemId,
        this.inputVar[i].value(),
        this.steps,
        this.itemSettings,
        this.recipeSettings,
        this.fuel,
        this.oilRecipe,
        this.data
      );
    }
  }

  calculateRecipes() {
    this.disabled =
      this.oilRecipe === RecipeId.BasicOilProcessing
        ? {
            [RecipeId.AdvancedOilProcessing]: true,
            [RecipeId.CoalLiquefaction]: true,
            [RecipeId.SolidFuelFromLightOil]: true,
            [RecipeId.SolidFuelFromHeavyOil]: true,
            [RecipeId.HeavyOilCracking]: true,
            [RecipeId.LightOilCracking]: true,
          }
        : this.oilRecipe === RecipeId.AdvancedOilProcessing
        ? {
            [RecipeId.BasicOilProcessing]: true,
            [RecipeId.CoalLiquefaction]: true,
          }
        : this.oilRecipe === RecipeId.CoalLiquefaction
        ? {
            [RecipeId.BasicOilProcessing]: true,
            [RecipeId.AdvancedOilProcessing]: true,
          }
        : {};

    for (const step of this.steps) {
      if (
        step.recipeId !== (step.itemId as string) &&
        !this.itemSettings[step.itemId].ignore
      ) {
        // Find recipes with this output
        const recipeMatches = this.data.recipeIds
          .map((r) => this.data.recipeR[r])
          .filter((r) => !this.disabled[r.id] && r.out && r.out[step.itemId]);
        if (recipeMatches.length > 0) {
          this.value[step.itemId] = step.items;
          for (const recipe of recipeMatches) {
            this.parseRecipeRecursively(recipe);
          }
        }
      }
    }

    this.recipeIds = Object.keys(this.recipes) as RecipeId[];
  }

  findRecipesRecursively(itemId: ItemId) {
    const simpleRecipe = this.data.recipeR[itemId];
    if (simpleRecipe) {
      if (!this.disabled[simpleRecipe.id]) {
        this.parseRecipeRecursively(this.data.recipeR[itemId]);
      }
    } else {
      // Find complex recipes
      const recipeMatches = this.data.recipeIds
        .map((r) => this.data.recipeR[r])
        .filter((r) => !this.disabled[r.id] && r.out && r.out[itemId]);

      for (const recipe of recipeMatches) {
        this.parseRecipeRecursively(recipe);
      }
    }
  }

  parseRecipeRecursively(recipe: RationalRecipe) {
    if (!this.recipes[recipe.id] && recipe.in) {
      this.recipes[recipe.id] = recipe;

      // Recurse recipe ingredients
      for (const id of Object.keys(recipe.in).filter(
        (i) => !this.itemSettings[i].ignore
      )) {
        this.findRecipesRecursively(id as ItemId);
      }
    }
  }
}

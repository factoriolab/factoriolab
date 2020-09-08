import {
  Step,
  Dataset,
  Entities,
  RationalRecipe,
  RationalItem,
  Rational,
  Solver,
  Variable,
  Expression,
  Constraint,
  Strength,
  Operator,
  WATER_ID,
  toBoolEntities,
} from '~/models';
import { ItemsState } from '~/store/items';
import { RecipesState } from '~/store/recipes';
import { RateUtility } from './rate.utility';

const COST_WATER = Rational.hundred;
const COST_INPUT = new Rational(BigInt(10000));

export class MatrixUtility {
  static solveMatricesFor(
    steps: Step[],
    itemSettings: ItemsState,
    recipeSettings: RecipesState,
    disabledRecipes: string[],
    fuel: string,
    data: Dataset
  ) {
    steps = steps.map((s) => ({ ...s }));
    const matrix = new MatrixSolver(
      steps,
      itemSettings,
      recipeSettings,
      disabledRecipes,
      fuel,
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

    return this.solveTryCatch(steps, matrix);
  }

  static solveTryCatch(steps: Step[], matrix: MatrixSolver) {
    try {
      matrix.solve();
      return matrix.steps;
    } catch (e) {
      console.warn('Matrix: Failed to solve, returning incomplete steps');
      console.error(e);
      return steps;
    }
  }
}

export class MatrixSolver {
  steps: Step[];
  itemSettings: ItemsState;
  recipeSettings: RecipesState;
  recipeDisabled: Entities<boolean>;
  fuel: string;
  data: Dataset;

  depth: number;
  value: Entities<Rational> = {};
  recipes: Entities<RationalRecipe> = {};
  recipeIds: string[] = [];
  usedRecipeIds: string[] = [];
  mappedRecipeIds: string[] = [];
  recipeVar: Entities<Variable> = {};
  items: Entities<RationalItem> = {};
  itemIds: string[] = [];
  outputs: string[] = [];
  surplusVar: Entities<Variable> = {};
  inputVar: Entities<Variable> = {};

  solver = new Solver();

  constructor(
    steps: Step[],
    itemSettings: ItemsState,
    recipeSettings: RecipesState,
    disabledRecipes: string[],
    fuel: string,
    data: Dataset
  ) {
    this.steps = steps;
    this.itemSettings = itemSettings;
    this.recipeSettings = recipeSettings;
    this.recipeDisabled = toBoolEntities(disabledRecipes);
    this.fuel = fuel;
    this.data = data;
    this.depth = Math.max(...this.steps.map((s) => s.depth)) + 1;
  }

  get simpleStepsOnly() {
    return !this.steps.some(
      (s) =>
        s.itemId &&
        (!s.recipeId || s.recipeId !== this.data.itemRecipeIds[s.itemId]) &&
        !this.itemSettings[s.itemId].ignore
    );
  }

  get simpleRecipesOnly() {
    return (
      Object.keys(this.value).length === 0 ||
      Object.keys(this.value).every((v) => this.value[v].isZero())
    );
  }

  calculateRecipes() {
    for (const step of this.steps.filter((s) => s.itemId)) {
      if (
        (!step.recipeId ||
          step.recipeId !== this.data.itemRecipeIds[step.itemId]) &&
        !this.itemSettings[step.itemId].ignore
      ) {
        // Find recipes with this output
        const recipeMatches = this.data.recipeIds
          .map((r) => this.data.recipeR[r])
          .filter(
            (r) => !this.recipeDisabled[r.id] && r.out && r.out[step.itemId]
          );
        if (recipeMatches.length > 0) {
          this.value[step.itemId] = step.items;
          for (const recipe of recipeMatches) {
            this.parseRecipeRecursively(recipe);
          }
        }
      }
    }

    this.recipeIds = Object.keys(this.recipes);
  }

  findRecipesRecursively(itemId: string) {
    const simpleRecipeId = this.data.itemRecipeIds[itemId];
    if (simpleRecipeId) {
      this.parseRecipeRecursively(this.data.recipeR[simpleRecipeId]);
    } else {
      // Find complex recipes
      const recipeMatches = this.data.recipeIds
        .map((r) => this.data.recipeR[r])
        .filter((r) => !this.recipeDisabled[r.id] && r.out && r.out[itemId]);

      for (const recipe of recipeMatches) {
        this.parseRecipeRecursively(recipe);
      }
    }
  }

  parseRecipeRecursively(recipe: RationalRecipe) {
    if (!this.recipes[recipe.id] && !this.recipeDisabled[recipe.id]) {
      const circular = this.checkForCircularRecipes(recipe);
      if (!circular) {
        this.recipes[recipe.id] = recipe;

        if (recipe.in) {
          // Recurse recipe ingredients
          for (const id of Object.keys(recipe.in).filter(
            (i) => !this.itemSettings[i].ignore
          )) {
            this.findRecipesRecursively(id);
          }
        }
      } else {
        this.recipeDisabled[recipe.id] = true;
        console.warn(
          `Matrix: Ignoring recipe '${recipe.id}' due to detected circular recipes.`
        );
      }
    }
  }

  /** Before adding this recipe, need to make sure it doesn't result in a circular loop */
  checkForCircularRecipes(recipe: RationalRecipe) {
    if (recipe.in) {
      const outputs = Object.keys(recipe.out);
      for (const id of Object.keys(recipe.in)) {
        // Need to check whether there are any loops where these inputs are outputs
        for (const loop of Object.keys(this.recipes)
          .map((r) => this.recipes[r])
          .filter((r) => r.in && r.out[id])) {
          // Found a recipe that outputs this input, look for connection between these recipes
          if (this.checkForCircularRecursively(outputs, loop)) {
            return true; // Found a circular loop
          }
        }
      }
    }
    return false;
  }

  /** Recursively check recipe inputs looking for a circular loop, return true if found */
  checkForCircularRecursively(
    outputs: string[],
    recipe: RationalRecipe,
    checked: string[] = []
  ) {
    if (outputs.some((o) => recipe.in[o])) {
      return true; // Found a complete circular loop in recipes
    }
    for (const id of Object.keys(recipe.in)) {
      for (const loop of Object.keys(this.recipes)
        .map((r) => this.recipes[r])
        .filter((r) => r.in && r.out[id] && !checked.some((c) => c === r.id))) {
        if (
          this.checkForCircularRecursively(outputs, loop, [
            ...checked,
            recipe.id,
          ])
        ) {
          return true; // Some sub-recipe found a loop, return the result
        }
      }
    }
    return false; // No loop found
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
    this.parseSolutionParents();
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
          this.outputs.push(outId);
        }
      }
      this.recipeVar[r] = variable;
    }

    this.itemIds = Object.keys(this.items);
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
        if (recipe.in && recipe.in[i]) {
          expr = expr.minus(new Expression([recipe.in[i], rVar]));
        }
        if (recipe.out[i]) {
          expr = expr.plus(new Expression([recipe.out[i], rVar]));
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
      if (r === WATER_ID) {
        factoryExpr = factoryExpr.minus(
          new Expression([COST_WATER, this.recipeVar[r]])
        );
      } else if (this.data.recipeR[r].mining) {
        factoryExpr = factoryExpr.minus(
          new Expression([COST_INPUT, this.recipeVar[r]])
        );
      } else {
        factoryExpr = factoryExpr.minus(this.recipeVar[r]);
      }
    }
    let costExpr = new Expression(cost);
    for (const i of Object.keys(this.inputVar)) {
      costExpr = costExpr.minus(new Expression([COST_INPUT, this.inputVar[i]]));
    }

    this.solver.addConstraint(new Constraint(factoryExpr, Operator.Eq));
    this.solver.addConstraint(new Constraint(costExpr, Operator.Eq));
    this.solver.suggestValue(cost, Rational.zero);
  }

  parseSolutionRecipes() {
    this.usedRecipeIds = Object.keys(this.recipeVar).filter((r) => {
      return this.recipeVar[r].value.nonzero();
    });
  }

  parseSolutionOutputs() {
    for (const i of this.outputs) {
      const surplusVal = this.surplusVar[i].value;
      let itemOutput = Rational.zero;
      for (const r of this.usedRecipeIds) {
        if (this.data.recipeR[r].out[i]) {
          itemOutput = itemOutput.add(
            this.data.recipeR[r].out[i].mul(this.recipeVar[r].value)
          );
        }
      }
      if (itemOutput.nonzero()) {
        let step = this.steps.find((s) => s.itemId === i);
        const matches = this.usedRecipeIds.filter(
          (r) =>
            !this.mappedRecipeIds.some((m) => m === r) &&
            this.data.recipeR[r].out[i]
        );
        const recipeId = matches.length ? matches[0] : null;
        if (step) {
          step.depth = this.depth;
          if (this.value[i]) {
            step.items = itemOutput;
          } else {
            step.items = step.items.add(itemOutput);
          }
        } else {
          step = {
            depth: this.depth,
            itemId: i,
            items: itemOutput,
          };
          this.steps.push(step);
        }
        if (recipeId) {
          step.recipeId = recipeId;
          step.factories = this.recipeVar[recipeId].value.mul(
            this.data.recipeR[recipeId].time
          );
          const recipe = this.data.recipeR[recipeId];
          RateUtility.adjustPowerPollution(step, recipe);
          this.mappedRecipeIds.push(recipeId);
        }
        if (surplusVal.nonzero()) {
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
        depth: this.depth + 1,
        itemId: null,
        items: null,
        recipeId: r,
        factories: this.recipeVar[r].value.mul(this.data.recipeR[r].time),
      });
    }
  }

  parseSolutionInputs() {
    for (const i of Object.keys(this.inputVar).filter((id) =>
      this.inputVar[id].value.nonzero()
    )) {
      // Item has simple recipe, calculate inputs
      RateUtility.addStepsFor(
        i,
        this.inputVar[i].value,
        this.steps,
        this.itemSettings,
        this.recipeSettings,
        this.fuel,
        this.data,
        this.depth + 2
      );
    }
  }

  parseSolutionParents() {
    for (const r of this.usedRecipeIds) {
      const recipe = this.data.recipeR[r];
      if (recipe.in) {
        const factories = this.recipeVar[r].value;
        for (const i of Object.keys(recipe.in)) {
          const step = this.steps.find((s) => s.itemId === i);
          const value = recipe.in[i].mul(factories);
          RateUtility.addParentValue(step, r, value);
        }
      }
    }
  }
}

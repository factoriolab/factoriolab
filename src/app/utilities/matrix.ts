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
    data: RationalDataset,
    previous: Entities<Rational> = {}
  ) {
    if (!steps.some((s) => !s.recipeId && !itemSettings[s.itemId].ignore)) {
      return steps;
    }

    let recipes: Entities<RationalRecipe> = {};
    const value: Entities<Rational> = {};
    const solver = new Solver();

    for (const step of steps) {
      if (!step.recipeId && !itemSettings[step.itemId].ignore) {
        // Find recipes with this output
        const recipeMatches = data.recipeIds
          .map((r) => data.recipeR[r])
          .filter((r) => r.out && r.out[step.itemId]);
        if (recipeMatches.length > 0) {
          value[step.itemId] = step.items;
          for (const recipe of recipeMatches) {
            recipes[recipe.id] = recipe;

            // Check inputs for more matrices
            for (const inId of Object.keys(recipe.in)) {
              recipes = this.findComplexRecipesRecursively(
                inId as ItemId,
                recipes,
                data
              );
            }
          }
        }
      }
    }

    if (Object.keys(value).length === 0) {
      // No matrix steps found
      return steps;
    }

    if (
      Object.keys(value).every((v) => previous[v] && value[v].eq(previous[v]))
    ) {
      // No new matrix steps
      return steps;
    }

    switch (oilRecipe) {
      case RecipeId.BasicOilProcessing:
        delete recipes[RecipeId.AdvancedOilProcessing];
        delete recipes[RecipeId.CoalLiquefaction];
        delete recipes[RecipeId.SolidFuelFromLightOil];
        delete recipes[RecipeId.SolidFuelFromHeavyOil];
        break;
      case RecipeId.AdvancedOilProcessing:
        delete recipes[RecipeId.BasicOilProcessing];
        delete recipes[RecipeId.CoalLiquefaction];
        break;
      case RecipeId.CoalLiquefaction:
        delete recipes[RecipeId.BasicOilProcessing];
        delete recipes[RecipeId.AdvancedOilProcessing];
        break;
    }

    const items: Entities<RationalItem> = {};
    const recipeVar: Entities<Variable> = {};
    const outputs: ItemId[] = [];
    const recipeIds = Object.keys(recipes);
    for (const r of recipeIds) {
      const variable = new Variable();
      solver.addEditVariable(variable, Strength.weak);
      solver.addConstraint(
        new Constraint(new Expression(variable), Operator.Ge)
      );

      const recipe = data.recipeR[r];
      for (const inId of Object.keys(recipe.in)) {
        items[inId] = data.itemR[inId];
      }
      for (const outId of Object.keys(recipe.out)) {
        items[outId] = data.itemR[outId];
        if (!outputs.some((o) => o === outId)) {
          outputs.push(outId as ItemId);
        }
      }
      recipeVar[r] = variable;
    }

    const surplusVar: Entities<Variable> = {};
    const inputVar: Entities<Variable> = {};
    for (const i of Object.keys(items)) {
      const surplus = new Variable();
      solver.addEditVariable(surplus, Strength.weak);
      solver.addConstraint(
        new Constraint(new Expression(surplus), Operator.Ge)
      );

      let expr = new Expression([Rational.minusOne, surplus]);
      if (value[i]) {
        expr = expr.minus(value[i]);
      }
      for (const r of recipeIds) {
        const recipe = data.recipeR[r];
        const rVar = recipeVar[r];
        if (recipe.in) {
          for (const inId of Object.keys(recipe.in).filter((id) => i === id)) {
            expr = expr.minus(new Expression([recipe.in[inId], rVar]));
          }
        }
        if (recipe.out) {
          for (const outId of Object.keys(recipe.out).filter(
            (id) => i === id
          )) {
            expr = expr.plus(new Expression([recipe.out[outId], rVar]));
          }
        }
      }

      if (!outputs.some((o) => o === i)) {
        // Input only
        const inVariable = new Variable();
        solver.addEditVariable(inVariable, Strength.weak);
        expr = expr.plus(new Expression(inVariable));
        inputVar[i] = inVariable;
      }

      solver.addConstraint(new Constraint(expr, Operator.Eq));
      surplusVar[i] = surplus;
    }

    // Add tax/cost
    const tax = new Variable();
    const cost = new Variable();
    solver.addEditVariable(tax, Strength.weak);
    solver.addEditVariable(cost, Strength.weak);

    let factoryExpr = new Expression(tax);
    for (const r of recipeIds) {
      factoryExpr = factoryExpr.minus(recipeVar[r]);
    }
    let costExpr = new Expression(cost);
    for (const i of Object.keys(inputVar)) {
      if (data.recipeR[i]) {
        costExpr = costExpr.minus(
          new Expression([Rational.hundred, inputVar[i]])
        );
      } else {
        costExpr = costExpr.minus(
          new Expression([Rational.thousand, inputVar[i]])
        );
      }
    }

    solver.addConstraint(new Constraint(factoryExpr, Operator.Eq));
    solver.addConstraint(new Constraint(costExpr, Operator.Eq));

    solver.suggestValue(cost, Rational.zero);

    solver.updateVariables();

    const usedRecipeIds = Object.keys(recipeVar).filter((r) => {
      return recipeVar[r].value().gt(Rational.zero);
    });
    const mappedRecipeIds = [];
    for (const i of outputs) {
      const surplusVal = surplusVar[i].value();
      let itemOutput = Rational.zero;
      for (const r of Object.keys(recipeVar)) {
        if (data.recipeR[r].out[i]) {
          const test = data.recipeR[r].out[i];
          itemOutput = itemOutput.add(
            data.recipeR[r].out[i].mul(recipeVar[r].value())
          );
        }
      }
      let step = steps.find((s) => s.itemId === i);
      const matches = usedRecipeIds.filter(
        (r) => !mappedRecipeIds.some((m) => m === r) && data.recipeR[r].out[i]
      );
      const recipeId = matches.length ? matches[0] : null;
      if (step) {
        step.items = itemOutput;
      } else {
        step = {
          itemId: i,
          items: itemOutput,
        };
        steps.push(step);
      }
      if (recipeId) {
        step.recipeId = recipeId as RecipeId;
        step.factories = recipeVar[recipeId]
          .value()
          .mul(data.recipeR[recipeId].time);
        mappedRecipeIds.push(recipeId);
      }
      if (surplusVal.gt(Rational.zero)) {
        step.surplus = surplusVal;
      }
    }

    for (const r of usedRecipeIds.filter(
      (i) => !mappedRecipeIds.some((m) => m === i)
    )) {
      steps.push({
        itemId: null,
        items: null,
        recipeId: r as RecipeId,
        factories: recipeVar[r].value().mul(data.recipeR[r].time),
      });
    }

    for (const i of Object.keys(inputVar)) {
      // Item has simple recipe, calculate inputs
      RateUtility.addStepsFor(
        null,
        i as ItemId,
        inputVar[i].value(),
        steps,
        itemSettings,
        recipeSettings,
        fuel,
        oilRecipe,
        data
      );
    }

    steps = this.solveMatricesFor(
      steps,
      itemSettings,
      recipeSettings,
      fuel,
      oilRecipe,
      data,
      value
    );

    return steps;
  }

  static findComplexRecipesRecursively(
    itemId: ItemId,
    recipes: Entities<RationalRecipe>,
    data: RationalDataset
  ) {
    if (data.recipeR[itemId]) {
      // Simple recipe
      return recipes;
    }

    // Find recipes with this output that haven't been processed yet
    const recipeMatches = data.recipeIds
      .map((r) => data.recipeR[r])
      .filter(
        (r) =>
          r.out &&
          r.out[itemId] &&
          !Object.keys(recipes).some((x) => x === r.id)
      );

    for (const recipe of recipeMatches) {
      recipes[recipe.id] = recipe;

      // Check inputs for more matrices
      for (const inId of Object.keys(recipe.in)) {
        recipes = this.findComplexRecipesRecursively(
          inId as ItemId,
          recipes,
          data
        );
      }
    }

    return recipes;
  }
}

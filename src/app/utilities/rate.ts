import Fraction from 'fraction.js';

import {
  Step,
  DisplayRate,
  Entities,
  ItemId,
  RecipeId,
  Factors,
} from '~/models';
import { DatasetState } from '~/store/dataset';
import { RecipeState } from '~/store/recipe';

export class RateUtility {
  public static addStepsFor(
    id: ItemId,
    rate: Fraction,
    steps: Step[],
    settings: RecipeState,
    factors: Entities<Factors>,
    belt: ItemId,
    oilRecipe: RecipeId,
    data: DatasetState
  ) {
    let recipe = data.recipeEntities[id];

    if (!recipe) {
      // No recipe for this step, check for simple oil recipes
      recipe = this.findBasicOilRecipe(id, oilRecipe, data);
    }

    // Find existing step for this item
    let step = steps.find((s) => s.itemId === id);

    if (!step) {
      // No existing step found, create a new one
      const item = data.itemEntities[id];
      step = {
        itemId: id,
        items: new Fraction(0),
        factories: new Fraction(0),
        settings: recipe
          ? settings[recipe.id]
          : { lane: item.stack ? belt : ItemId.Pipe },
      };

      steps.push(step);
    }

    // Add items to the step
    step.items = step.items.add(rate);

    if (recipe) {
      // Mark complex recipes
      if ((recipe.id as string) !== id) {
        step.settings.recipeId = recipe.id;
      }

      // Recurse adding steps for ingredients
      if (recipe.in) {
        // Calculate number of outputs from recipe
        const out = new Fraction(recipe.out ? recipe.out[id] : 1).mul(
          factors[recipe.id].prod
        );

        for (const ingredient of Object.keys(recipe.in)) {
          RateUtility.addStepsFor(
            ingredient as ItemId,
            rate.mul(recipe.in[ingredient]).div(out),
            steps,
            settings,
            factors,
            belt,
            oilRecipe,
            data
          );
        }
      }
    }
  }

  public static calculateFactories(
    steps: Step[],
    factors: Entities<Factors>,
    data: DatasetState
  ) {
    for (const step of steps) {
      const recipeId = step.settings.recipeId
        ? step.settings.recipeId
        : step.itemId;
      const recipe = data.recipeEntities[recipeId];
      if (recipe) {
        const o = new Fraction(recipe.out ? recipe.out[step.itemId] : 1);
        const f = factors[recipe.id];
        step.factories = step.items
          .mul(recipe.time)
          .div(o)
          .div(f.speed)
          .div(f.prod);
      }
    }
    return steps;
  }

  public static calculateLanes(steps: Step[], laneSpeed: Entities<Fraction>) {
    for (const step of steps) {
      if (step.items) {
        step.lanes = step.items.div(laneSpeed[step.settings.lane]);
      }
    }
    return steps;
  }

  public static displayRate(steps: Step[], displayRate: DisplayRate) {
    for (const step of steps) {
      if (step.items) {
        step.items = step.items.mul(displayRate);
      }
      if (step.surplus) {
        step.surplus = step.surplus.mul(displayRate);
      }
    }
    return steps;
  }

  public static findBasicOilRecipe(
    id: ItemId,
    oilRecipeId: RecipeId,
    data: DatasetState
  ) {
    if (oilRecipeId === RecipeId.BasicOilProcessing) {
      // Using Basic Oil processing, use simple recipes
      if (id === ItemId.PetroleumGas) {
        // To produce petroleum gas, use oil recipe
        return data.recipeEntities[oilRecipeId];
      } else if (id === ItemId.SolidFuel) {
        // To produce solid fuel, use petroleum fuel recipe
        return data.recipeEntities[RecipeId.SolidFuelFromPetroleumGas];
      }
    }
    return null;
  }
}

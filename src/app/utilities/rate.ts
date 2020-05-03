import Fraction from 'fraction.js';

import {
  Step,
  DisplayRate,
  Entities,
  ItemId,
  RecipeId,
  Factors,
  CategoryId,
} from '~/models';
import { DatasetState } from '~/store/dataset';
import { RecipeState } from '~/store/recipe';

export class RateUtility {
  static LAUNCH_TIME = new Fraction(2420, 60);

  static addStepsFor(
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
    const categoryId = data.itemEntities[id].category;

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
    if (categoryId === CategoryId.Research) {
      step.items = step.items.add(rate.mul(factors[recipe.id].prod));
    } else {
      step.items = step.items.add(rate);
    }

    if (recipe) {
      // Mark complex recipes
      if ((recipe.id as string) !== id) {
        step.settings.recipeId = recipe.id;
      }

      const f = factors[recipe.id];

      // Calculate number of outputs from recipe
      const prod =
        data.itemEntities[id].category === CategoryId.Research
          ? new Fraction(1)
          : f.prod;
      const out = new Fraction(recipe.out ? recipe.out[id] : 1).mul(prod);

      // Calculate factories
      if (id === ItemId.SpaceSciencePack) {
        // Factories are for rocket parts, space science packs are a side effect
        step.factories = null;
      } else {
        step.factories = step.items.mul(recipe.time).div(out).div(f.speed);
        if (categoryId === CategoryId.Research) {
          step.factories = step.factories.div(f.prod);
        }
        // Add # of factories to actually launch rockets
        if (id === ItemId.RocketPart) {
          step.factories = step.factories.add(
            step.items.div(100).mul(this.LAUNCH_TIME)
          );
        }
      }

      // Recurse adding steps for ingredients
      if (recipe.in) {
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

  static calculateLanes(steps: Step[], laneSpeed: Entities<Fraction>) {
    for (const step of steps) {
      if (step.items) {
        step.lanes = step.items.div(laneSpeed[step.settings.lane]);
      }
    }
    return steps;
  }

  static displayRate(steps: Step[], displayRate: DisplayRate) {
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

  static findBasicOilRecipe(
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

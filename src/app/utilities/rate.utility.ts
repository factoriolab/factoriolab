import {
  Step,
  Dataset,
  DisplayRate,
  Entities,
  Rational,
  DisplayRateVal,
  RationalRecipe,
  WAGON_FLUID,
  WAGON_STACKS,
  ItemId,
} from '~/models';
import { ItemsState } from '~/store/items';

export class RateUtility {
  static LAUNCH_TIME = new Rational(BigInt(2420), BigInt(60));

  static addStepsFor(
    itemId: string,
    rate: Rational,
    steps: Step[],
    itemSettings: ItemsState,
    data: Dataset,
    parentId: string = null
  ) {
    const recipe = data.recipeR[data.itemRecipeIds[itemId]];

    // Find existing step for this item
    let step = steps.find((s) => s.itemId === itemId);

    if (step) {
      steps.push(steps.splice(steps.indexOf(step), 1)[0]);
    } else {
      // No existing step found, create a new one
      step = {
        itemId,
        recipeId: recipe ? recipe.id : null,
        items: Rational.zero,
        factories: Rational.zero,
      };

      steps.push(step);
    }

    // Adjust for consumption instead of production if desired
    if (recipe?.adjustProd) {
      rate = rate.mul(recipe.adjustProd);
    }

    // Add items to the step
    step.items = step.items.add(rate);

    this.addParentValue(step, parentId, rate);

    if (recipe) {
      // Calculate number of outputs from recipe
      const out = recipe.out[itemId];

      // Calculate factories
      if (
        recipe.producers[0] === ItemId.RocketSilo &&
        itemId !== ItemId.RocketPart
      ) {
        // Factories are for rocket parts, space science packs are a side effect
        step.factories = null;
      } else {
        step.factories = step.items.mul(recipe.time).div(out);
        // Add # of factories to actually launch rockets
        if (itemId === ItemId.RocketPart) {
          step.factories = step.factories.add(
            step.items.div(Rational.hundred).mul(this.LAUNCH_TIME)
          );
        }
      }

      this.adjustPowerPollution(step, recipe);

      // Recurse adding steps for ingredients
      if (
        recipe.in &&
        step.items.nonzero() &&
        !itemSettings[step.itemId].ignore
      ) {
        for (const ingredient of Object.keys(recipe.in)) {
          const ingredientRate = rate.mul(recipe.in[ingredient]).div(out);
          RateUtility.addStepsFor(
            ingredient,
            ingredientRate,
            steps,
            itemSettings,
            data,
            recipe.id
          );
        }
      }
    }
  }

  static addParentValue(step: Step, parentId: string, rate: Rational) {
    if (parentId) {
      if (!step.parents) {
        step.parents = {};
      }
      if (step.parents[parentId]) {
        step.parents[parentId] = step.parents[parentId].add(rate);
      } else {
        step.parents[parentId] = rate;
      }
    }
  }

  static adjustPowerPollution(step: Step, recipe: RationalRecipe) {
    if (step.factories?.nonzero()) {
      // Calculate power
      if (recipe.consumption?.nonzero()) {
        step.power = step.factories.mul(recipe.consumption);
      }
      // Calculate pollution
      if (recipe.pollution?.nonzero()) {
        step.pollution = step.factories.mul(recipe.pollution);
      }
    }
  }

  static calculateBelts(
    steps: Step[],
    itemSettings: ItemsState,
    beltSpeed: Entities<Rational>,
    data: Dataset
  ) {
    for (const step of steps) {
      const belt = itemSettings[step.itemId]?.belt;
      if (step.items && belt) {
        step.belts = step.items.div(beltSpeed[belt]);
        if (belt === ItemId.Pipe) {
          step.wagons = step.items.div(WAGON_FLUID);
        } else {
          step.wagons = step.items.div(
            WAGON_STACKS.mul(data.itemR[step.itemId].stack)
          );
        }
      }
    }
    return steps;
  }

  static displayRate(steps: Step[], displayRate: DisplayRate) {
    const displayRateVal = DisplayRateVal[displayRate];
    for (const step of steps) {
      if (step.items) {
        if (step.parents) {
          for (const key of Object.keys(step.parents)) {
            step.parents[key] = step.parents[key].div(step.items);
          }
        }
        step.items = step.items.mul(displayRateVal);
      }
      if (step.surplus) {
        step.surplus = step.surplus.mul(displayRateVal);
      }
      if (step.wagons) {
        step.wagons = step.wagons.mul(displayRateVal);
      }
      if (step.pollution) {
        step.pollution = step.pollution.mul(displayRateVal);
      }
    }
    return steps;
  }

  static copy(steps: Step[]) {
    return steps.map((s) =>
      s.parents ? { ...s, ...{ parents: { ...s.parents } } } : { ...s }
    );
  }
}

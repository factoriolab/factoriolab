import Fraction from 'fraction.js';

import { Step, Recipe, RateType, DisplayRate, Entities, Item } from '~/models';
import { SettingsState } from '~/store/settings';
import { RecipeState } from '~/store/recipe';

const WAGON_STACKS = 40;
const WAGON_FLUID = 25000;

export class RateUtility {
  public static toFactories(
    rate: Fraction,
    time: Fraction,
    quantity: Fraction,
    factors: [Fraction, Fraction]
  ) {
    return rate
      .mul(time)
      .div(quantity)
      .div(factors[0].mul(factors[1]));
  }

  public static toRate(
    factories: Fraction,
    time: Fraction,
    quantity: Fraction,
    factors: [Fraction, Fraction]
  ) {
    return factories
      .div(time)
      .mul(quantity)
      .mul(factors[0].mul(factors[1]));
  }

  public static normalizeRate(
    rate: Fraction,
    rateType: RateType,
    displayRate: DisplayRate,
    stack: number,
    beltSpeed: number,
    flowRate: number,
    recipe: Recipe,
    recipeFactors: Entities<[Fraction, Fraction]>
  ) {
    switch (rateType) {
      case RateType.Items:
        return rate.div(displayRate);
      case RateType.Lanes:
        return rate.mul(stack ? beltSpeed : flowRate);
      case RateType.Wagons:
        return rate
          .div(displayRate)
          .mul(stack ? stack * WAGON_STACKS : WAGON_FLUID);
      case RateType.Factories:
        return this.toRate(
          rate,
          new Fraction(recipe.time),
          new Fraction(recipe.out ? recipe.out[recipe.id] : 1),
          recipeFactors[recipe.id]
        );
      default:
        return rate;
    }
  }

  public static addStepsFor(
    id: string,
    rate: Fraction,
    recipe: Recipe,
    steps: Step[],
    recipeSettings: RecipeState,
    laneSpeed: Entities<Fraction>,
    recipeFactors: Entities<[Fraction, Fraction]>,
    itemEntities: Entities<Item>,
    recipeEntities: Entities<Recipe>,
    settings: SettingsState
  ) {
    // Find existing step for this item
    let step = steps.find(s => s.itemId === id);

    if (!step) {
      // No existing step found, create a new one
      const item = itemEntities[id];
      step = {
        itemId: id,
        items: new Fraction(0),
        factories: new Fraction(0),
        settings: recipe
          ? recipeSettings[recipe.id]
          : { lane: item.stack ? settings.belt : 'pipe' }
      };

      steps.push(step);
    }

    // Add items to the step
    step.items = step.items.add(rate);
    step.lanes = step.items.div(laneSpeed[step.settings.lane]);

    if (recipe) {
      // Calculate number of outputs from recipe
      const out = new Fraction(recipe.out ? recipe.out[id] : 1);

      // Calculate number of factories required
      step.factories = RateUtility.toFactories(
        step.items,
        new Fraction(recipe.time),
        out,
        recipeFactors[recipe.id]
      );

      // Recurse adding steps for ingredients
      if (recipe.in) {
        for (const ingredient of Object.keys(recipe.in)) {
          RateUtility.addStepsFor(
            ingredient,
            rate
              .mul(recipe.in[ingredient])
              .div(out)
              .div(recipeFactors[recipe.id][1]),
            recipeEntities[ingredient],
            steps,
            recipeSettings,
            laneSpeed,
            recipeFactors,
            itemEntities,
            recipeEntities,
            settings
          );
        }
      }
    }
  }

  public static displayRate(steps: Step[], displayRate: DisplayRate) {
    for (const step of steps) {
      step.items = step.items.mul(displayRate);
    }
    return steps;
  }

  public static addOilSteps(
    recipe: Recipe,
    steps: Step[],
    recipeSettings: RecipeState,
    laneSpeed: Entities<Fraction>,
    recipeFactors: Entities<[Fraction, Fraction]>,
    itemEntities: Entities<Item>,
    recipeEntities: Entities<Recipe>,
    settings: SettingsState
  ) {
    const outputs = Object.keys(recipe.out);
    if (outputs.length === 1) {
      // Using basic oil processing, use simple calculation
      const step = steps.find(s => s.itemId === outputs[0]);

      if (step) {
        step.settings = recipeSettings[recipe.id];
        step.settings.recipeId = recipe.id;

        // Only calculate if oil processing output is found as a step
        const out = new Fraction(recipe.out[step.itemId]);

        // Calculate number of factories required
        step.factories = RateUtility.toFactories(
          step.items,
          new Fraction(recipe.time),
          out,
          recipeFactors[recipe.id]
        );

        // Recurse adding steps for ingredients
        if (recipe.in) {
          for (const ingredient of Object.keys(recipe.in)) {
            RateUtility.addStepsFor(
              ingredient,
              step.items
                .mul(recipe.in[ingredient])
                .div(out)
                .div(recipeFactors[recipe.id][1]),
              recipeEntities[ingredient],
              steps,
              recipeSettings,
              laneSpeed,
              recipeFactors,
              itemEntities,
              recipeEntities,
              settings
            );
          }
        }
      }
    } else {
      return null;
    }
  }
}

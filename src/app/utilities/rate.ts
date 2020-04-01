import Fraction from 'fraction.js';

import { Step, Recipe, RateType, DisplayRate } from '../models';
import { RecipeState } from '../store/recipe';

const WAGON_STACKS = 40;
const WAGON_FLUID = 25000;

export class Rate {
  public static toFactories(
    rate: Fraction,
    time: Fraction,
    quantity: Fraction,
    factors: [Fraction, Fraction]
  ) {
    return rate
      .div(quantity)
      .mul(time)
      .div(factors[0].mul(factors[1]));
  }

  public static toRate(
    factories: Fraction,
    time: Fraction,
    quantity: Fraction,
    factors: [Fraction, Fraction]
  ) {
    return factories
      .mul(quantity)
      .div(time)
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
    recipeFactors: [Fraction, Fraction]
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
          recipeFactors
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
    beltSpeed: { [id: string]: Fraction },
    recipeFactors: { [id: string]: [Fraction, Fraction] },
    recipes: { [id: string]: Recipe }
  ) {
    // Find existing step for this item
    let step = steps.find(s => s.itemId === id);

    if (!step) {
      // No existing step found, create a new one
      step = {
        itemId: id,
        items: new Fraction(0),
        factory: recipe ? recipeSettings[recipe.id].factory : null,
        factories: new Fraction(0)
      };
      steps.push(step);
    }

    // Add items to the step
    step.items = step.items.add(rate);

    if (recipe) {
      // Calculate recipe and ingredients
      step.belt = recipeSettings[recipe.id].belt;
      step.modules = recipeSettings[recipe.id].modules;
      step.beaconType = recipeSettings[recipe.id].beaconType;
      step.beaconCount = recipeSettings[recipe.id].beaconCount;
      step.lanes = step.items.div(beltSpeed[step.belt]);

      // Calculate number of outputs from recipe
      const out = new Fraction(recipe.out ? recipe.out[id] : 1);

      // Calculate number of factories required
      step.factories = Rate.toFactories(
        step.items,
        new Fraction(recipe.time),
        out,
        recipeFactors[recipe.id]
      );

      // Recurse adding steps for ingredients
      for (const ingredient in recipe.in) {
        if (recipe.in[ingredient]) {
          Rate.addStepsFor(
            ingredient,
            rate
              .mul(recipe.in[ingredient])
              .div(out)
              .div(recipeFactors[recipe.id][1]),
            recipes[ingredient],
            steps,
            recipeSettings,
            beltSpeed,
            recipeFactors,
            recipes
          );
        }
      }
    }
  }
}

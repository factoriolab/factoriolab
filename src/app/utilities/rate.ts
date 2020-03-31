import Fraction from 'fraction.js';
import { Step, Recipe } from '../models';
import { RecipeState } from '../store/recipe';

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
    let step = steps.find(s => s.itemId === id);
    if (!step) {
      step = {
        itemId: id,
        items: new Fraction(0),
        factory: recipe ? recipeSettings[recipe.id].factory : null,
        factories: new Fraction(0)
      };
      steps.push(step);
    }
    step.items = step.items.add(rate);
    if (recipe) {
      step.belt = recipeSettings[recipe.id].belt;
      step.lanes = step.items.div(beltSpeed[step.belt]);
      const out = new Fraction(recipe.out ? recipe.out[id] : 1);
      step.factories = Rate.toFactories(
        step.items,
        new Fraction(recipe.time),
        out,
        recipeFactors[recipe.id]
      );
      step.modules = recipeSettings[recipe.id].modules;
      step.beaconType = recipeSettings[recipe.id].beaconType;
      step.beaconCount = recipeSettings[recipe.id].beaconCount;
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

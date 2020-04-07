import Fraction from 'fraction.js';

import { Step, Recipe, RateType, DisplayRate, Entities, Item } from '~/models';
import { SettingsState } from '~/store/settings';
import { RecipeState } from '~/store/recipe';

const WAGON_STACKS = 40;
const WAGON_FLUID = 25000;

enum OilProduct {
  Heavy = 'heavy-oil',
  Light = 'light-oil',
  Petrol = 'petroleum-gas',
  Fuel = 'solid-fuel',
}

enum OilRecipe {
  Basic = 'basic-oil-processing',
  Advanced = 'advanced-oil-processing',
  Coal = 'coal-liquefaction',
}

enum Cracking {
  Heavy = 'heavy-oil-cracking',
  Light = 'light-oil-cracking',
}

export enum FuelRecipe {
  Heavy = 'solid-fuel-from-heavy-oil',
  Light = 'solid-fuel-from-light-oil',
  Petrol = 'solid-fuel-from-petroleum-gas',
}

export class RateUtility {
  /**
   * factories = rate * time
   *             quantity * prod * speed
   */
  public static toFactories(
    rate: Fraction,
    time: Fraction,
    quantity: Fraction,
    factors: [Fraction, Fraction]
  ) {
    return rate.mul(time).div(quantity.mul(factors[0]).mul(factors[1]));
  }

  /**
   * rate = factories * quantity * prod * speed
   *        time
   */
  public static toRate(
    factories: Fraction,
    time: Fraction,
    quantity: Fraction,
    factors: [Fraction, Fraction]
  ) {
    return factories.div(time).mul(quantity.mul(factors[0]).mul(factors[1]));
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
    if (!recipe) {
      // No recipe for this step, check for simple oil recipes
      recipe = this.findBasicOilRecipe(id, settings.oilRecipe, recipeEntities);
    }

    // Find existing step for this item
    let step = steps.find((s) => s.itemId === id);

    if (!step) {
      // No existing step found, create a new one
      const item = itemEntities[id];
      step = {
        itemId: id,
        items: new Fraction(0),
        factories: new Fraction(0),
        settings: recipe
          ? recipeSettings[recipe.id]
          : { lane: item.stack ? settings.belt : 'pipe' },
      };

      steps.push(step);
    }

    // Add items to the step
    step.items = step.items.add(rate);
    step.lanes = step.items.div(laneSpeed[step.settings.lane]);

    if (recipe) {
      // Mark complex recipes
      if (recipe.id !== id) {
        step.settings.recipeId = recipe.id;
      }

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
      if (step.surplus) {
        step.surplus = step.surplus.mul(displayRate);
      }
    }
    return steps;
  }

  public static findBasicOilRecipe(
    id: string,
    oilRecipeId: string,
    recipeEntities: Entities<Recipe>
  ) {
    if (oilRecipeId === OilRecipe.Basic) {
      // Using Basic Oil processing, use simple recipes
      if (id === OilProduct.Petrol) {
        // To produce petroleum gas, use oil recipe
        return recipeEntities[oilRecipeId];
      } else if (id === OilProduct.Fuel) {
        // To produce solid fuel, use petroleum fuel recipe
        return recipeEntities[FuelRecipe.Petrol];
      }
    }
    return null;
  }

  public static addOilSteps(
    oilRecipeId: string,
    steps: Step[],
    recipeSettings: RecipeState,
    laneSpeed: Entities<Fraction>,
    recipeFactors: Entities<[Fraction, Fraction]>,
    recipeEntities: Entities<Recipe>
  ) {
    if (
      oilRecipeId === OilRecipe.Basic || // Already handled with basic recipes
      steps.every(
        (s) =>
          ([
            OilProduct.Heavy,
            OilProduct.Light,
            OilProduct.Petrol,
            OilProduct.Fuel,
          ] as string[]).indexOf(s.itemId) === -1
      ) // No matching oil products found in steps
    ) {
      return steps;
    }

    // Find Recipes
    const oilRecipe = recipeEntities[oilRecipeId];
    const hocRecipe = recipeEntities[Cracking.Heavy];
    const locRecipe = recipeEntities[Cracking.Light];
    const ltfRecipe = recipeEntities[FuelRecipe.Light];
    const ptfRecipe = recipeEntities[FuelRecipe.Petrol];

    // Calculate factors
    // Refinery
    const oilHeavy = new Fraction(oilRecipe.out[OilProduct.Heavy])
      .mul(recipeFactors[oilRecipe.id][1])
      .sub(oilRecipe.in[OilProduct.Heavy] ? oilRecipe.in[OilProduct.Heavy] : 0)
      .mul(recipeFactors[oilRecipe.id][0])
      .div(oilRecipe.time);
    const oilLight = new Fraction(oilRecipe.out[OilProduct.Light])
      .mul(recipeFactors[oilRecipe.id][1])
      .mul(recipeFactors[oilRecipe.id][0])
      .div(oilRecipe.time);
    const oilPetrol = new Fraction(oilRecipe.out[OilProduct.Petrol])
      .mul(recipeFactors[oilRecipe.id][1])
      .mul(recipeFactors[oilRecipe.id][0])
      .div(oilRecipe.time);
    // Heavy Oil Cracking
    const hocHeavyIn = new Fraction(hocRecipe.in[OilProduct.Heavy])
      .mul(recipeFactors[hocRecipe.id][0])
      .div(hocRecipe.time);
    const hocLight = new Fraction(hocRecipe.out[OilProduct.Light])
      .mul(recipeFactors[hocRecipe.id][1])
      .mul(recipeFactors[hocRecipe.id][0])
      .div(hocRecipe.time);
    const hocFactories = oilHeavy.div(hocHeavyIn);
    const hocFactoriesLight = hocFactories.mul(hocLight);
    // Light Oil Cracking
    const maxLight = oilLight.add(hocFactoriesLight);
    const locLightIn = new Fraction(locRecipe.in[OilProduct.Light])
      .mul(recipeFactors[locRecipe.id][0])
      .div(locRecipe.time);
    const locPetrol = new Fraction(locRecipe.out[OilProduct.Petrol])
      .mul(recipeFactors[locRecipe.id][1])
      .mul(recipeFactors[locRecipe.id][0])
      .div(locRecipe.time);
    const locFactories = maxLight.div(locLightIn);
    const locFactoriesPetrol = locFactories.mul(locPetrol);
    const maxPetrol = oilPetrol.add(locFactoriesPetrol);
    // Light to Fuel
    const ltfLightIn = new Fraction(ltfRecipe.in[OilProduct.Light])
      .mul(recipeFactors[ltfRecipe.id][0])
      .div(ltfRecipe.time);
    const ltfFuel = new Fraction(ltfRecipe.out[OilProduct.Fuel])
      .mul(recipeFactors[ltfRecipe.id][1])
      .mul(recipeFactors[ltfRecipe.id][0])
      .div(ltfRecipe.time);
    const ltfFactories = maxLight.div(ltfLightIn);
    const ltfFactoriesFuel = ltfFactories.mul(ltfFuel);
    // Petrol to Fuel
    const ptfPetrolIn = new Fraction(ptfRecipe.in[OilProduct.Petrol])
      .mul(recipeFactors[ptfRecipe.id][0])
      .div(ptfRecipe.time);
    const ptfFuel = new Fraction(ptfRecipe.out[OilProduct.Fuel])
      .mul(recipeFactors[ptfRecipe.id][1])
      .mul(recipeFactors[ptfRecipe.id][0])
      .div(ptfRecipe.time);
    const ptfFactories = oilPetrol.div(ptfPetrolIn);
    const ptfFactoriesFuel = ptfFactories.mul(ptfFuel);

    // Find / Setup steps
    let heavyStep = steps.find((s) => s.itemId === OilProduct.Heavy);
    let lightStep = steps.find((s) => s.itemId === OilProduct.Light);
    let petrolStep = steps.find((s) => s.itemId === OilProduct.Petrol);
    if (!heavyStep) {
      heavyStep = {
        itemId: OilProduct.Heavy,
        items: new Fraction(0),
        factories: new Fraction(0),
      };

      steps.push(heavyStep);
    }
    heavyStep.settings = recipeSettings[oilRecipe.id];
    heavyStep.settings.recipeId = oilRecipe.id;

    if (!lightStep) {
      lightStep = {
        itemId: OilProduct.Light,
        items: new Fraction(0),
        factories: new Fraction(0),
      };

      steps.push(lightStep);
    }
    lightStep.surplus = new Fraction(0);
    lightStep.settings = recipeSettings[Cracking.Heavy];
    lightStep.settings.recipeId = Cracking.Heavy;

    if (!petrolStep) {
      petrolStep = {
        itemId: OilProduct.Petrol,
        items: new Fraction(0),
        factories: new Fraction(0),
      };

      steps.push(petrolStep);
    }
    petrolStep.surplus = new Fraction(0);
    petrolStep.settings = recipeSettings[Cracking.Light];
    petrolStep.settings.recipeId = Cracking.Light;

    const fuelStep = steps.find((s) => s.itemId === OilProduct.Fuel);

    // Calculate number of refineries required for heavy, surplus light/petrol
    if (heavyStep.items.n > 0) {
      // Refineries required for heavy
      const refineries = heavyStep.items.div(oilHeavy);
      // Surplus light
      lightStep.surplus = lightStep.surplus.add(refineries.mul(oilLight));

      heavyStep.factories = heavyStep.factories.add(refineries);
    }

    // Calculate number of refineries and heavy-to-light plants required for light, excess petrol
    if (lightStep.items.n > 0) {
      if (lightStep.surplus >= lightStep.items) {
        // Already producing enough light oil, subtract from surplus
        lightStep.surplus = lightStep.surplus.sub(lightStep.items);
      } else {
        // Subtract any surplus from what is required
        const required = lightStep.items.sub(lightStep.surplus);
        lightStep.surplus = new Fraction(0);
        // Refineries required for light
        const refineries = required.div(maxLight);
        // Heavy-to-light plants required for light
        const hocPlants = refineries.mul(hocFactories);

        heavyStep.factories = heavyStep.factories.add(refineries);
        lightStep.factories = lightStep.factories.add(hocPlants);
      }
    }

    // Surplus petrol
    petrolStep.surplus = petrolStep.surplus.add(
      heavyStep.factories.mul(oilPetrol)
    );

    // Calculate number of refineries and heavy-to-light plants required for light-to-fuel, excess petrol
    if (fuelStep && fuelStep.items.n > 0) {
      let required = fuelStep.items.div(ltfFuel).mul(ltfLightIn);
      if (lightStep.surplus >= required) {
        // Already producing enough light oil, subtract from surplus
        lightStep.surplus = lightStep.surplus.sub(required);
        fuelStep.factories = fuelStep.items.div(ltfFuel);
        fuelStep.settings = recipeSettings[FuelRecipe.Light];
        fuelStep.settings.recipeId = ltfRecipe.id;
      } else {
        // Subtract any surplus from what is required
        required = required.sub(lightStep.surplus);
        // Refineries required for light
        const refineries = required.div(maxLight);
        // Heavy-to-light plants required for light
        const hocPlants = refineries.mul(hocFactories);
        // Surplus petrol
        const petrolSurplus = petrolStep.surplus.add(refineries.mul(oilPetrol));

        if (petrolSurplus < petrolStep.items) {
          // Still need more petrol. Finalize this step and continue...
          lightStep.surplus = new Fraction(0);
          heavyStep.factories = heavyStep.factories.add(refineries);
          lightStep.factories = lightStep.factories.add(hocPlants);
          fuelStep.factories = fuelStep.items.div(ltfFuel);
          fuelStep.settings = recipeSettings[ltfRecipe.id];
          fuelStep.settings.recipeId = ltfRecipe.id;
          petrolStep.surplus = petrolSurplus;
        }
      }
    }

    if (!fuelStep || fuelStep.items.n === 0 || fuelStep.factories.n > 0) {
      // Fuel is satisfied, move on to petroleum
      // Calculate number of refineries, heavy-to-light plants, and light-to-petrol plants required for petrol
      if (petrolStep.items.n > 0) {
        if (petrolStep.surplus >= petrolStep.items) {
          // Already producing enough petroleum, subtract from surplus
          petrolStep.surplus = petrolStep.surplus.sub(petrolStep.items);
        } else {
          // Subtract any surplus from what is required
          const required = petrolStep.items.sub(petrolStep.surplus);
          petrolStep.surplus = new Fraction(0);
          // Refineries required for petrol
          const refineries = required.div(maxPetrol);
          // Heavy-to-light plants required for light
          const hocPlants = refineries.mul(hocFactories);
          // Light-to-Petrol plants required for petrol
          const locPlants = refineries.mul(locFactories);

          heavyStep.factories = heavyStep.factories.add(refineries);
          lightStep.factories = lightStep.factories.add(hocPlants);
          petrolStep.factories = petrolStep.factories.add(locPlants);
        }
      }
    } else {
      // Fuel was not satisfied above
      // Calculate number of refineries and heavy-to-light plants required for petrol, excess light
      if (petrolStep.items.n > 0) {
        if (petrolStep.surplus >= petrolStep.items) {
          // Already producing enough petroleum, subtract from surplus
          petrolStep.surplus = petrolStep.surplus.sub(petrolStep.items);
        } else {
          // Subtract any surplus from what is required
          const required = petrolStep.items.sub(petrolStep.surplus);
          petrolStep.surplus = new Fraction(0);
          // Refineries required for petrol, refinery output only
          const refineries = required.div(oilPetrol);
          // Heavy-to-light plants required for light
          const hocPlants = refineries.mul(hocFactories);

          heavyStep.factories = heavyStep.factories.add(refineries);
          lightStep.factories = lightStep.factories.add(hocPlants);
          lightStep.surplus = lightStep.surplus.add(refineries.mul(maxLight));
        }
      }
    }

    //   Convert excess light to fuel using light-to-fuel
    //   Calculate number of refineries and heavy-to-light plants required for combined light-to-fuel/petrol-to-fuel

    // Calculate lanes
    heavyStep.lanes = heavyStep.items.div(laneSpeed[heavyStep.settings.lane]);
    lightStep.lanes = lightStep.items.div(laneSpeed[lightStep.settings.lane]);
    petrolStep.lanes = petrolStep.items.div(
      laneSpeed[petrolStep.settings.lane]
    );
    if (fuelStep) {
      fuelStep.lanes = fuelStep.items.div(laneSpeed[fuelStep.settings.lane]);
    }

    return steps;
  }
}

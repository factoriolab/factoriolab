import Fraction from 'fraction.js';

import { Step, Recipe, DisplayRate, Entities } from '~/models';
import { DatasetState } from '~/store/dataset';
import { RecipeState } from '~/store/recipe';

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
    factors: { speed: Fraction; prod: Fraction }
  ) {
    return rate.mul(time).div(quantity.mul(factors.speed).mul(factors.prod));
  }

  /**
   * rate = factories * quantity * prod * speed
   *        time
   */
  public static toRate(
    factories: Fraction,
    time: Fraction,
    quantity: Fraction,
    factors: { speed: Fraction; prod: Fraction }
  ) {
    return factories
      .div(time)
      .mul(quantity.mul(factors.speed).mul(factors.prod));
  }

  public static addStepsFor(
    id: string,
    rate: Fraction,
    steps: Step[],
    recipeSettings: RecipeState,
    recipeFactors: Entities<{ speed: Fraction; prod: Fraction }>,
    belt: string,
    oilRecipe: string,
    data: DatasetState
  ) {
    let recipe = data.recipeEntities[id];

    if (!recipe) {
      // No recipe for this step, check for simple oil recipes
      recipe = this.findBasicOilRecipe(id, oilRecipe, data.recipeEntities);
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
          ? recipeSettings[recipe.id]
          : { lane: item.stack ? belt : 'pipe' },
      };

      steps.push(step);
    }

    // Add items to the step
    step.items = step.items.add(rate);

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
              .div(recipeFactors[recipe.id].prod),
            steps,
            recipeSettings,
            recipeFactors,
            belt,
            oilRecipe,
            data
          );
        }
      }
    }
  }

  public static calculateLanes(steps: Step[], laneSpeed: Entities<Fraction>) {
    for (const step of steps) {
      step.lanes = step.items.div(laneSpeed[step.settings.lane]);
    }
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
    recipeFactors: Entities<{ speed: Fraction; prod: Fraction }>,
    data: DatasetState
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
    const oilRecipe = data.recipeEntities[oilRecipeId];
    const hocRecipe = data.recipeEntities[Cracking.Heavy];
    const locRecipe = data.recipeEntities[Cracking.Light];
    const ltfRecipe = data.recipeEntities[FuelRecipe.Light];
    const ptfRecipe = data.recipeEntities[FuelRecipe.Petrol];

    // Calculate factors
    // Refinery
    const oilHeavy = new Fraction(oilRecipe.out[OilProduct.Heavy])
      .mul(recipeFactors[oilRecipe.id].prod)
      .sub(oilRecipe.in[OilProduct.Heavy] ? oilRecipe.in[OilProduct.Heavy] : 0)
      .div(oilRecipe.time);
    const oilLight = new Fraction(oilRecipe.out[OilProduct.Light])
      .mul(recipeFactors[oilRecipe.id].prod)
      .div(oilRecipe.time);
    const oilPetrol = new Fraction(oilRecipe.out[OilProduct.Petrol])
      .mul(recipeFactors[oilRecipe.id].prod)
      .div(oilRecipe.time);
    // Heavy Oil Cracking
    const hocHeavyIn = new Fraction(hocRecipe.in[OilProduct.Heavy]).div(
      hocRecipe.time
    );
    const hocLight = new Fraction(hocRecipe.out[OilProduct.Light])
      .mul(recipeFactors[hocRecipe.id].prod)
      .div(hocRecipe.time);
    const hocFactories = oilHeavy.div(hocHeavyIn);
    const hocFactoriesLight = hocFactories.mul(hocLight);
    // Light Oil Cracking
    const maxLight = oilLight.add(hocFactoriesLight);
    const locLightIn = new Fraction(locRecipe.in[OilProduct.Light]).div(
      locRecipe.time
    );
    const locPetrol = new Fraction(locRecipe.out[OilProduct.Petrol])
      .mul(recipeFactors[locRecipe.id].prod)
      .div(locRecipe.time);
    const locFactories = maxLight.div(locLightIn);
    const locFactoriesPetrol = locFactories.mul(locPetrol);
    const maxPetrol = oilPetrol.add(locFactoriesPetrol);
    // Light to Fuel
    const ltfLightIn = new Fraction(ltfRecipe.in[OilProduct.Light]).div(
      ltfRecipe.time
    );
    const ltfFuel = new Fraction(ltfRecipe.out[OilProduct.Fuel])
      .mul(recipeFactors[ltfRecipe.id].prod)
      .div(ltfRecipe.time);
    const ltfFactories = maxLight.div(ltfLightIn);
    const ltfFactoriesFuel = ltfFactories.mul(ltfFuel);
    // Petrol to Fuel
    const ptfPetrolIn = new Fraction(ptfRecipe.in[OilProduct.Petrol]).div(
      ptfRecipe.time
    );
    const ptfFuel = new Fraction(ptfRecipe.out[OilProduct.Fuel])
      .mul(recipeFactors[ptfRecipe.id].prod)
      .div(ptfRecipe.time);
    const ptfFactories = oilPetrol.div(ptfPetrolIn);
    const ptfFactoriesFuel = ptfFactories.mul(ptfFuel);
    const maxFuel = ltfFactoriesFuel.add(ptfFactoriesFuel);

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
    if (fuelStep) {
      fuelStep.settings = recipeSettings[FuelRecipe.Light];
      fuelStep.settings.recipeId = FuelRecipe.Light;
    }
    let ptfStep: Step = null;

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
      if (fuelStep && fuelStep.items.n > 0) {
        // Process surplus light oil
        let fuelRequired = fuelStep.items;
        const lightRequired = fuelRequired.div(ltfFuel).mul(ltfLightIn);
        if (lightStep.surplus >= lightRequired) {
          // Already producing enough light oil, subtract from surplus
          lightStep.surplus = lightStep.surplus.sub(lightRequired);
          fuelStep.factories = fuelRequired.div(ltfFuel);
        } else {
          // Subtract any surplus
          const newFuelRequired = lightRequired
            .sub(lightStep.surplus)
            .mul(ltfFuel)
            .div(ltfLightIn);
          lightStep.surplus = new Fraction(0);
          fuelStep.factories = fuelRequired.sub(newFuelRequired).div(ltfFuel);
          fuelRequired = newFuelRequired;
        }

        if (fuelRequired.n > 0) {
          ptfStep = {
            itemId: null,
            items: null,
            factories: new Fraction(0),
            settings: recipeSettings[ptfRecipe.id],
          };
          ptfStep.settings.recipeId = ptfRecipe.id;
          steps.push(ptfStep);

          // Need more fuel, process surplus petrol
          const petrolRequired = fuelRequired.div(ptfFuel).mul(ptfPetrolIn);
          if (petrolStep.surplus >= petrolRequired) {
            // Already producing enough petrol, subtract from surplus
            petrolStep.surplus = petrolStep.surplus.sub(petrolRequired);
            ptfStep.factories = fuelRequired.div(ptfFuel);
          } else {
            // Subtract any surplus
            const newFuelRequired = petrolRequired
              .sub(petrolStep.surplus)
              .mul(ptfFuel)
              .div(ptfPetrolIn);
            petrolStep.surplus = new Fraction(0);
            ptfStep.factories = fuelRequired.sub(newFuelRequired).div(ptfFuel);
            fuelRequired = newFuelRequired;
          }

          if (fuelRequired.n > 0) {
            // Calculate number of refineries and heavy-to-light plants required for combined light-to-fuel/petrol-to-fuel
            // Refineries required for fuel
            const refineries = fuelRequired.div(maxFuel);
            // Heavy-to-light plants required for light
            const hocPlants = refineries.mul(hocFactories);
            // Light-to-fuel plants required for fuel
            const ltfPlants = refineries.mul(ltfFactories);
            // Petrol-to-fuel plants required for fuel
            const ptfPlants = refineries.mul(ptfFactories);

            heavyStep.factories = heavyStep.factories.add(refineries);
            lightStep.factories = lightStep.factories.add(hocPlants);
            fuelStep.factories = fuelStep.factories.add(ltfPlants);
            ptfStep.factories = ptfStep.factories.add(ptfPlants);
          }
        }
      }
    }

    // Calculate total items
    // 1) From refineries
    heavyStep.items = heavyStep.factories.mul(oilHeavy);
    lightStep.items = heavyStep.factories.mul(oilLight);
    petrolStep.items = heavyStep.factories.mul(oilPetrol);
    // 2) From cracking
    lightStep.items = lightStep.items.add(lightStep.factories.mul(hocLight));
    petrolStep.items = petrolStep.items.add(
      petrolStep.factories.mul(locPetrol)
    );

    // Calculate refinery inputs
    for (const ingredient of Object.keys(oilRecipe.in)) {
      if (ingredient !== OilProduct.Heavy) {
        this.addStepsFor(
          ingredient,
          heavyStep.items
            .mul(oilRecipe.in[ingredient])
            .div(oilRecipe.out[OilProduct.Heavy])
            .div(recipeFactors[oilRecipe.id].prod),
          steps,
          recipeSettings,
          recipeFactors,
          null, // Fluid, belt is irrelevant
          oilRecipeId,
          data
        );
      }
    }
    // Calculate loc inputs
    const waterId = 'water';
    this.addStepsFor(
      waterId,
      lightStep.factories
        .mul(hocLight)
        .mul(hocRecipe.in[waterId])
        .div(hocRecipe.out[OilProduct.Light])
        .div(recipeFactors[hocRecipe.id].prod),
      steps,
      recipeSettings,
      recipeFactors,
      null, // Fluid, belt is irrelevant
      oilRecipeId,
      data
    );
    // Calculate poc inputs
    this.addStepsFor(
      waterId,
      petrolStep.factories
        .mul(locPetrol)
        .mul(locRecipe.in[waterId])
        .div(locRecipe.out[OilProduct.Petrol])
        .div(recipeFactors[locRecipe.id].prod),
      steps,
      recipeSettings,
      recipeFactors,
      null, // Fluid, belt is irrelevant
      oilRecipeId,
      data
    );

    // Scale out factories based on speed factors
    heavyStep.factories = heavyStep.factories.div(
      recipeFactors[oilRecipe.id].speed
    );
    lightStep.factories = lightStep.factories.div(
      recipeFactors[hocRecipe.id].speed
    );
    petrolStep.factories = petrolStep.factories.div(
      recipeFactors[locRecipe.id].speed
    );
    if (fuelStep) {
      fuelStep.factories = fuelStep.factories.div(
        recipeFactors[fuelStep.settings.recipeId].speed
      );
    }
    if (ptfStep) {
      ptfStep.factories = ptfStep.factories.div(
        recipeFactors[ptfStep.settings.recipeId].speed
      );
    }

    return steps;
  }
}

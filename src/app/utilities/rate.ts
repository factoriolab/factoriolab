import Fraction from 'fraction.js';

import { Step, DisplayRate, Entities, ItemId, RecipeId } from '~/models';
import { DatasetState } from '~/store/dataset';
import { RecipeState } from '~/store/recipe';

export class RateUtility {
  public static addStepsFor(
    id: ItemId,
    rate: Fraction,
    steps: Step[],
    settings: RecipeState,
    factors: Entities<{ speed: Fraction; prod: Fraction }>,
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
    factors: Entities<{ speed: Fraction; prod: Fraction }>,
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
  }

  public static calculateLanes(steps: Step[], laneSpeed: Entities<Fraction>) {
    for (const step of steps) {
      if (step.items) {
        step.lanes = step.items.div(laneSpeed[step.settings.lane]);
      }
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

  public static addOilSteps(
    oilRecipeId: RecipeId,
    steps: Step[],
    settings: RecipeState,
    factors: Entities<{ speed: Fraction; prod: Fraction }>,
    data: DatasetState
  ) {
    if (
      oilRecipeId === RecipeId.BasicOilProcessing || // Already handled with basic recipes
      steps.every(
        (s) =>
          ([
            ItemId.HeavyOil,
            ItemId.LightOil,
            ItemId.PetroleumGas,
            ItemId.SolidFuel,
          ] as string[]).indexOf(s.itemId) === -1
      ) // No matching oil products found in steps
    ) {
      return steps;
    }

    // Find Recipes
    const oilRecipe = data.recipeEntities[oilRecipeId];
    const hocRecipe = data.recipeEntities[RecipeId.HeavyOilCracking];
    const locRecipe = data.recipeEntities[RecipeId.LightOilCracking];
    const ltfRecipe = data.recipeEntities[RecipeId.SolidFuelFromLightOil];
    const ptfRecipe = data.recipeEntities[RecipeId.SolidFuelFromPetroleumGas];

    // Calculate factors
    // Refinery
    const oilHeavy = new Fraction(oilRecipe.out[ItemId.HeavyOil])
      .mul(factors[oilRecipe.id].prod)
      .sub(oilRecipe.in[ItemId.HeavyOil] ? oilRecipe.in[ItemId.HeavyOil] : 0)
      .div(oilRecipe.time);
    const oilLight = new Fraction(oilRecipe.out[ItemId.LightOil])
      .mul(factors[oilRecipe.id].prod)
      .div(oilRecipe.time);
    const oilPetrol = new Fraction(oilRecipe.out[ItemId.PetroleumGas])
      .mul(factors[oilRecipe.id].prod)
      .div(oilRecipe.time);
    // Heavy Oil Cracking
    const hocHeavyIn = new Fraction(hocRecipe.in[ItemId.HeavyOil]).div(
      hocRecipe.time
    );
    const hocLight = new Fraction(hocRecipe.out[ItemId.LightOil])
      .mul(factors[hocRecipe.id].prod)
      .div(hocRecipe.time);
    const hocFactories = oilHeavy.div(hocHeavyIn);
    const hocFactoriesLight = hocFactories.mul(hocLight);
    // Light Oil Cracking
    const maxLight = oilLight.add(hocFactoriesLight);
    const locLightIn = new Fraction(locRecipe.in[ItemId.LightOil]).div(
      locRecipe.time
    );
    const locPetrol = new Fraction(locRecipe.out[ItemId.PetroleumGas])
      .mul(factors[locRecipe.id].prod)
      .div(locRecipe.time);
    const locFactories = maxLight.div(locLightIn);
    const locFactoriesPetrol = locFactories.mul(locPetrol);
    const maxPetrol = oilPetrol.add(locFactoriesPetrol);
    // Light to Fuel
    const ltfLightIn = new Fraction(ltfRecipe.in[ItemId.LightOil]).div(
      ltfRecipe.time
    );
    const ltfFuel = new Fraction(ltfRecipe.out[ItemId.SolidFuel])
      .mul(factors[ltfRecipe.id].prod)
      .div(ltfRecipe.time);
    const ltfFactories = maxLight.div(ltfLightIn);
    const ltfFactoriesFuel = ltfFactories.mul(ltfFuel);
    // Petrol to Fuel
    const ptfPetrolIn = new Fraction(ptfRecipe.in[ItemId.PetroleumGas]).div(
      ptfRecipe.time
    );
    const ptfFuel = new Fraction(ptfRecipe.out[ItemId.SolidFuel])
      .mul(factors[ptfRecipe.id].prod)
      .div(ptfRecipe.time);
    const ptfFactories = oilPetrol.div(ptfPetrolIn);
    const ptfFactoriesFuel = ptfFactories.mul(ptfFuel);
    const maxFuel = ltfFactoriesFuel.add(ptfFactoriesFuel);

    // Find / Setup steps
    let heavyStep = steps.find((s) => s.itemId === ItemId.HeavyOil);
    let lightStep = steps.find((s) => s.itemId === ItemId.LightOil);
    let petrolStep = steps.find((s) => s.itemId === ItemId.PetroleumGas);
    if (!heavyStep) {
      heavyStep = {
        itemId: ItemId.HeavyOil,
        items: new Fraction(0),
        factories: new Fraction(0),
      };

      steps.push(heavyStep);
    }
    heavyStep.settings = settings[oilRecipe.id];
    heavyStep.settings.recipeId = oilRecipe.id;

    if (!lightStep) {
      lightStep = {
        itemId: ItemId.LightOil,
        items: new Fraction(0),
        factories: new Fraction(0),
      };

      steps.push(lightStep);
    }
    lightStep.surplus = new Fraction(0);
    lightStep.settings = settings[hocRecipe.id];
    lightStep.settings.recipeId = hocRecipe.id;

    if (!petrolStep) {
      petrolStep = {
        itemId: ItemId.PetroleumGas,
        items: new Fraction(0),
        factories: new Fraction(0),
      };

      steps.push(petrolStep);
    }
    petrolStep.surplus = new Fraction(0);
    petrolStep.settings = settings[locRecipe.id];
    petrolStep.settings.recipeId = locRecipe.id;

    const fuelStep = steps.find((s) => s.itemId === ItemId.SolidFuel);
    if (fuelStep) {
      fuelStep.settings = settings[ltfRecipe.id];
      fuelStep.settings.recipeId = ltfRecipe.id;
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
            settings: settings[ptfRecipe.id],
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
      if (ingredient !== ItemId.HeavyOil) {
        this.addStepsFor(
          ingredient as ItemId,
          heavyStep.items
            .mul(oilRecipe.in[ingredient])
            .div(oilRecipe.out[ItemId.HeavyOil])
            .div(factors[oilRecipe.id].prod),
          steps,
          settings,
          factors,
          null, // Fluid, belt is irrelevant
          oilRecipeId,
          data
        );
      }
    }
    // Calculate loc inputs
    this.addStepsFor(
      ItemId.Water,
      lightStep.factories
        .mul(hocLight)
        .mul(hocRecipe.in[ItemId.Water])
        .div(hocRecipe.out[ItemId.LightOil])
        .div(factors[hocRecipe.id].prod),
      steps,
      settings,
      factors,
      null, // Fluid, belt is irrelevant
      oilRecipeId,
      data
    );
    // Calculate poc inputs
    this.addStepsFor(
      ItemId.Water,
      petrolStep.factories
        .mul(locPetrol)
        .mul(locRecipe.in[ItemId.Water])
        .div(locRecipe.out[ItemId.PetroleumGas])
        .div(factors[locRecipe.id].prod),
      steps,
      settings,
      factors,
      null, // Fluid, belt is irrelevant
      oilRecipeId,
      data
    );

    // Scale out factories based on speed factors
    heavyStep.factories = heavyStep.factories.div(factors[oilRecipe.id].speed);
    lightStep.factories = lightStep.factories.div(factors[hocRecipe.id].speed);
    petrolStep.factories = petrolStep.factories.div(
      factors[locRecipe.id].speed
    );
    if (fuelStep) {
      fuelStep.factories = fuelStep.factories.div(
        factors[fuelStep.settings.recipeId].speed
      );
    }
    if (ptfStep) {
      ptfStep.factories = ptfStep.factories.div(
        factors[ptfStep.settings.recipeId].speed
      );
    }

    return steps;
  }
}

import Fraction from 'fraction.js';

import { RecipeId, Step, Entities, ItemId, Recipe } from '~/models';
import { DatasetState } from '~/store/dataset';
import { RecipeState } from '~/store/recipe';
import { RateUtility } from './rate';

const OIL_ITEM = [
  ItemId.HeavyOil,
  ItemId.LightOil,
  ItemId.PetroleumGas,
  ItemId.SolidFuel,
];

interface OilMatrix {
  oil: { recipe: Recipe; heavy: Fraction; light: Fraction; petrol: Fraction };
  hoc: { recipe: Recipe; in: Fraction; light: Fraction };
  loc: { recipe: Recipe };
  ltf: { recipe: Recipe };
  ptf: { recipe: Recipe };
}

export class OilUtility {
  public static getOilMatrix(
    oilRecipeId: RecipeId,
    factors: Entities<{ speed: Fraction; prod: Fraction }>,
    data: DatasetState
  ): OilMatrix {
    const oilRecipe = data.recipeEntities[oilRecipeId];
    const oilFactors = factors[oilRecipeId];
    const hocRecipe = data.recipeEntities[RecipeId.HeavyOilCracking];
    const hocFactors = factors[RecipeId.HeavyOilCracking];
    const locRecipe = data.recipeEntities[RecipeId.LightOilCracking];
    const ltfRecipe = data.recipeEntities[RecipeId.SolidFuelFromLightOil];
    const ptfRecipe = data.recipeEntities[RecipeId.SolidFuelFromPetroleumGas];

    return {
      oil: {
        recipe: oilRecipe,
        heavy: new Fraction(oilRecipe.out[ItemId.HeavyOil])
          .mul(oilFactors.prod)
          .sub(
            oilRecipe.in[ItemId.HeavyOil] ? oilRecipe.in[ItemId.HeavyOil] : 0
          ),
        light: new Fraction(oilRecipe.out[ItemId.LightOil]).mul(
          oilFactors.prod
        ),
        petrol: new Fraction(oilRecipe.out[ItemId.PetroleumGas]).mul(
          oilFactors.prod
        ),
      },
      hoc: {
        recipe: hocRecipe,
        in: new Fraction(hocRecipe.in[ItemId.HeavyOil]),
        light: new Fraction(hocRecipe.out[ItemId.LightOil]).mul(
          hocFactors.prod
        ),
      },
      loc: {
        recipe: locRecipe,
      },
      ltf: {
        recipe: ltfRecipe,
      },
      ptf: {
        recipe: ptfRecipe,
      },
    };
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
      steps.every((s) => OIL_ITEM.indexOf(s.itemId) === -1) // No matching oil products found in steps
    ) {
      return steps;
    }

    // Find Recipes
    const matrix = this.getOilMatrix(oilRecipeId, factors, data);

    // Calculate factors
    // Heavy Oil Cracking
    const hocFactories = matrix.oil.heavy.div(matrix.hoc.in);
    const hocFactoriesLight = hocFactories.mul(matrix.hoc.light);
    // Light Oil Cracking
    const maxLight = matrix.oil.light.add(hocFactoriesLight);
    const locLightIn = new Fraction(matrix.loc.recipe.in[ItemId.LightOil]);
    const locPetrol = new Fraction(
      matrix.loc.recipe.out[ItemId.PetroleumGas]
    ).mul(factors[matrix.loc.recipe.id].prod);
    const locFactories = maxLight.div(locLightIn);
    const locFactoriesPetrol = locFactories.mul(locPetrol);
    const maxPetrol = matrix.oil.petrol.add(locFactoriesPetrol);
    // Light to Fuel
    const ltfLightIn = new Fraction(matrix.ltf.recipe.in[ItemId.LightOil]);
    const ltfFuel = new Fraction(matrix.ltf.recipe.out[ItemId.SolidFuel]).mul(
      factors[matrix.ltf.recipe.id].prod
    );
    const ltfFactories = maxLight.div(ltfLightIn);
    const ltfFactoriesFuel = ltfFactories.mul(ltfFuel);
    // Petrol to Fuel
    const ptfPetrolIn = new Fraction(matrix.ptf.recipe.in[ItemId.PetroleumGas]);
    const ptfFuel = new Fraction(matrix.ptf.recipe.out[ItemId.SolidFuel]).mul(
      factors[matrix.ptf.recipe.id].prod
    );
    const ptfFactories = matrix.oil.petrol.div(ptfPetrolIn);
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
    heavyStep.settings = settings[matrix.oil.recipe.id];
    heavyStep.settings.recipeId = matrix.oil.recipe.id;

    if (!lightStep) {
      lightStep = {
        itemId: ItemId.LightOil,
        items: new Fraction(0),
        factories: new Fraction(0),
      };

      steps.push(lightStep);
    }
    lightStep.surplus = new Fraction(0);
    lightStep.settings = settings[matrix.hoc.recipe.id];
    lightStep.settings.recipeId = matrix.hoc.recipe.id;

    if (!petrolStep) {
      petrolStep = {
        itemId: ItemId.PetroleumGas,
        items: new Fraction(0),
        factories: new Fraction(0),
      };

      steps.push(petrolStep);
    }
    petrolStep.surplus = new Fraction(0);
    petrolStep.settings = settings[matrix.loc.recipe.id];
    petrolStep.settings.recipeId = matrix.loc.recipe.id;

    const fuelStep = steps.find((s) => s.itemId === ItemId.SolidFuel);
    if (fuelStep) {
      fuelStep.settings = settings[matrix.ltf.recipe.id];
      fuelStep.settings.recipeId = matrix.ltf.recipe.id;
    }
    let ptfStep: Step = null;

    // Calculate number of refineries required for heavy, surplus light/petrol
    if (heavyStep.items.n > 0) {
      // Refineries required for heavy
      const refineries = heavyStep.items.div(matrix.oil.heavy);
      // Surplus light
      lightStep.surplus = lightStep.surplus.add(
        refineries.mul(matrix.oil.light)
      );

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
      heavyStep.factories.mul(matrix.oil.petrol)
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
        const petrolSurplus = petrolStep.surplus.add(
          refineries.mul(matrix.oil.petrol)
        );

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
          const refineries = required.div(matrix.oil.petrol);
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
            settings: settings[matrix.ptf.recipe.id],
          };
          ptfStep.settings.recipeId = matrix.ptf.recipe.id;
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
    heavyStep.items = heavyStep.factories.mul(matrix.oil.heavy);
    lightStep.items = heavyStep.factories.mul(matrix.oil.light);
    petrolStep.items = heavyStep.factories.mul(matrix.oil.petrol);
    // 2) From cracking
    lightStep.items = lightStep.items.add(
      lightStep.factories.mul(matrix.hoc.light)
    );
    petrolStep.items = petrolStep.items.add(
      petrolStep.factories.mul(locPetrol)
    );

    // Calculate refinery inputs
    for (const ingredient of Object.keys(matrix.oil.recipe.in)) {
      if (ingredient !== ItemId.HeavyOil) {
        RateUtility.addStepsFor(
          ingredient as ItemId,
          heavyStep.items
            .mul(matrix.oil.recipe.in[ingredient])
            .div(matrix.oil.recipe.out[ItemId.HeavyOil])
            .div(factors[matrix.oil.recipe.id].prod),
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
    RateUtility.addStepsFor(
      ItemId.Water,
      lightStep.factories
        .mul(matrix.hoc.light)
        .mul(matrix.hoc.recipe.in[ItemId.Water])
        .div(matrix.hoc.recipe.out[ItemId.LightOil])
        .div(factors[matrix.hoc.recipe.id].prod),
      steps,
      settings,
      factors,
      null, // Fluid, belt is irrelevant
      oilRecipeId,
      data
    );
    // Calculate poc inputs
    RateUtility.addStepsFor(
      ItemId.Water,
      petrolStep.factories
        .mul(locPetrol)
        .mul(matrix.loc.recipe.in[ItemId.Water])
        .div(matrix.loc.recipe.out[ItemId.PetroleumGas])
        .div(factors[matrix.loc.recipe.id].prod),
      steps,
      settings,
      factors,
      null, // Fluid, belt is irrelevant
      oilRecipeId,
      data
    );

    // Scale out factories based on speed factors
    heavyStep.factories = heavyStep.factories
      .mul(matrix.oil.recipe.time)
      .div(factors[matrix.oil.recipe.id].speed);
    lightStep.factories = lightStep.factories
      .mul(matrix.hoc.recipe.time)
      .div(factors[matrix.hoc.recipe.id].speed);
    petrolStep.factories = petrolStep.factories
      .mul(matrix.loc.recipe.time)
      .div(factors[matrix.loc.recipe.id].speed);
    if (fuelStep) {
      fuelStep.factories = fuelStep.factories
        .mul(matrix.ltf.recipe.time)
        .div(factors[fuelStep.settings.recipeId].speed);
    }
    if (ptfStep) {
      ptfStep.factories = ptfStep.factories
        .mul(matrix.ptf.recipe.time)
        .div(factors[ptfStep.settings.recipeId].speed);
    }

    return steps;
  }
}

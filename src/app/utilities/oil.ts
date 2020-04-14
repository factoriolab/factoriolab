import Fraction from 'fraction.js';

import { RecipeId, Step, Entities, ItemId, Recipe, Factors } from '~/models';
import { DatasetState } from '~/store/dataset';
import { RecipeState } from '~/store/recipe';
import { RateUtility } from './rate';

const OIL_ITEM = [
  ItemId.HeavyOil,
  ItemId.LightOil,
  ItemId.PetroleumGas,
  ItemId.SolidFuel,
];

interface ProductionData {
  recipe: Recipe;
  heavy: Fraction;
  light: Fraction;
  petrol: Fraction;
}

interface ConversionData {
  recipe: Recipe;
  input: Fraction;
  output: Fraction;
  factories: Fraction;
  max: Fraction;
}

interface OilMatrix {
  oil: ProductionData;
  hoc: ConversionData;
  loc: ConversionData;
  ltf?: ConversionData;
  ptf?: ConversionData;
}

interface OilSteps {
  heavy: Step;
  light: Step;
  petrol: Step;
  fuel?: Step;
  fuelPetrol?: Step;
  fuelRequired?: Fraction;
}

export class OilUtility {
  /** Calculate data for oil refinery recipe */
  public static getProductionData(
    oilRecipeId: RecipeId,
    factors: Entities<Factors>,
    data: DatasetState
  ): ProductionData {
    const recipe = data.recipeEntities[oilRecipeId];
    const f = factors[oilRecipeId];

    return {
      recipe,
      heavy: new Fraction(recipe.out[ItemId.HeavyOil])
        .mul(f.prod)
        .sub(recipe.in[ItemId.HeavyOil] ? recipe.in[ItemId.HeavyOil] : 0),
      light: new Fraction(recipe.out[ItemId.LightOil]).mul(f.prod),
      petrol: new Fraction(recipe.out[ItemId.PetroleumGas]).mul(f.prod),
    };
  }

  /** Calculate data for oil conversion recipe */
  public static getConversionData(
    recipeId: RecipeId,
    inputId: ItemId,
    outputId: ItemId,
    consumes: Fraction,
    base: Fraction,
    factors: Entities<Factors>,
    data: DatasetState
  ): ConversionData {
    const recipe = data.recipeEntities[recipeId];
    const f = factors[recipeId];
    const input = new Fraction(recipe.in[inputId]);
    const output = new Fraction(recipe.out[outputId]).mul(f.prod);
    const factories = consumes.div(input);
    const max = base.add(factories.mul(output));

    return {
      recipe,
      input,
      output,
      factories,
      max,
    };
  }

  /** Find and calculate matrix for oil recipes */
  public static getOilMatrix(
    oilRecipeId: RecipeId,
    includeFuel: boolean,
    factors: Entities<Factors>,
    data: DatasetState
  ): OilMatrix {
    const oil = this.getProductionData(oilRecipeId, factors, data);
    const hoc = this.getConversionData(
      RecipeId.HeavyOilCracking,
      ItemId.HeavyOil,
      ItemId.LightOil,
      oil.heavy,
      oil.light,
      factors,
      data
    );
    const loc = this.getConversionData(
      RecipeId.LightOilCracking,
      ItemId.LightOil,
      ItemId.PetroleumGas,
      hoc.max,
      oil.petrol,
      factors,
      data
    );
    if (includeFuel) {
      const ltf = this.getConversionData(
        RecipeId.SolidFuelFromLightOil,
        ItemId.LightOil,
        ItemId.SolidFuel,
        hoc.max,
        new Fraction(0),
        factors,
        data
      );
      const ptf = this.getConversionData(
        RecipeId.SolidFuelFromPetroleumGas,
        ItemId.PetroleumGas,
        ItemId.SolidFuel,
        oil.petrol,
        ltf.max,
        factors,
        data
      );

      return { oil, hoc, loc, ltf, ptf };
    } else {
      return { oil, hoc, loc };
    }
  }

  /** Find or create a specific oil step */
  public static getOilStep(
    itemId: ItemId,
    recipeId: RecipeId,
    steps: Step[],
    settings: RecipeState
  ) {
    let step = steps.find((s) => s.itemId === itemId);
    if (!step) {
      step = {
        itemId,
        items: new Fraction(0),
        factories: new Fraction(0),
      };

      steps.push(step);
    }
    step.surplus = new Fraction(0);
    step.settings = settings[recipeId];
    step.settings.recipeId = recipeId;

    return step;
  }

  /** Find or create oil steps */
  public static getOilSteps(
    steps: Step[],
    matrix: OilMatrix,
    settings: RecipeState
  ): OilSteps {
    const heavy = this.getOilStep(
      ItemId.HeavyOil,
      matrix.oil.recipe.id,
      steps,
      settings
    );
    const light = this.getOilStep(
      ItemId.LightOil,
      matrix.hoc.recipe.id,
      steps,
      settings
    );
    const petrol = this.getOilStep(
      ItemId.PetroleumGas,
      matrix.loc.recipe.id,
      steps,
      settings
    );
    if (matrix.ltf) {
      const fuel = this.getOilStep(
        ItemId.SolidFuel,
        matrix.ltf.recipe.id,
        steps,
        settings
      );

      return { heavy, light, petrol, fuel };
    } else {
      return { heavy, light, petrol };
    }
  }

  /** Calculate number of refineries required for heavy, surplus light */
  public static calculateHeavyOil(step: OilSteps, matrix: OilMatrix): OilSteps {
    if (step.heavy.items.n > 0) {
      // Refineries required for heavy
      const refineries = step.heavy.items.div(matrix.oil.heavy);

      // Surplus light
      step.light.surplus = refineries.mul(matrix.oil.light);

      step.heavy.factories = refineries;
    }

    return step;
  }

  /** Calculate number of refineries required for light, surplus petrol */
  public static calculateLightOil(step: OilSteps, matrix: OilMatrix): OilSteps {
    if (step.light.items.n > 0) {
      if (step.light.surplus >= step.light.items) {
        // Already producing enough light oil, subtract from surplus
        step.light.surplus = step.light.surplus.sub(step.light.items);
      } else {
        // Subtract any surplus from what is required
        const required = step.light.items.sub(step.light.surplus);
        step.light.surplus = new Fraction(0);
        // Refineries required for light
        const refineries = required.div(matrix.hoc.max);
        // Heavy-to-light plants required for light
        const hocPlants = refineries.mul(matrix.hoc.factories);

        step.heavy.factories = step.heavy.factories.add(refineries);
        step.light.factories = step.light.factories.add(hocPlants);
      }
    }

    // Surplus petrol
    step.petrol.surplus = step.petrol.surplus.add(
      step.heavy.factories.mul(matrix.oil.petrol)
    );

    return step;
  }

  /** Try calculating number of refineries and heavy-to-light plants required for full light-to-fuel conversion, excess petrol */
  public static tryCalculateLightToFuel(step: OilSteps, matrix: OilMatrix): OilSteps {
    if (step.fuel && step.fuel.items.n > 0) {
      let required = step.fuel.items
        .div(matrix.ltf.output)
        .mul(matrix.ltf.input);
      if (step.light.surplus >= required) {
        // Already producing enough light oil, subtract from surplus
        step.light.surplus = step.light.surplus.sub(required);
        step.fuel.factories = step.fuel.items.div(matrix.ltf.output);
      } else {
        // Subtract any surplus from what is required
        required = required.sub(step.light.surplus);
        // Refineries required for light
        const refineries = required.div(matrix.hoc.max);
        // Heavy-to-light plants required for light
        const hocPlants = refineries.mul(matrix.hoc.factories);

        // Surplus petrol
        const newPetrolSurplus = step.petrol.surplus.add(
          refineries.mul(matrix.oil.petrol)
        );

        if (newPetrolSurplus < step.petrol.items) {
          // Still need more petrol. Finalize this step and continue...
          step.light.surplus = new Fraction(0);
          step.heavy.factories = step.heavy.factories.add(refineries);
          step.light.factories = step.light.factories.add(hocPlants);
          step.fuel.factories = step.fuel.items.div(matrix.ltf.output);
          step.petrol.surplus = newPetrolSurplus;
        }
      }
    }

    return step;
  }

  /** Calculate number of refineries, heavy-to-light plants, and light-to-petrol plants required for petrol */
  public static calculatePetroleumGas(step: OilSteps, matrix: OilMatrix): OilSteps {
    if (step.petrol.items.n > 0) {
      if (step.petrol.surplus >= step.petrol.items) {
        // Already producing enough petroleum, subtract from surplus
        step.petrol.surplus = step.petrol.surplus.sub(step.petrol.items);
      } else {
        // Subtract any surplus from what is required
        const required = step.petrol.items.sub(step.petrol.surplus);
        step.petrol.surplus = new Fraction(0);
        // Refineries required for petrol
        const refineries = required.div(matrix.loc.max);
        // Heavy-to-light plants required for light
        const hocPlants = refineries.mul(matrix.hoc.factories);
        // Light-to-Petrol plants required for petrol
        const locPlants = refineries.mul(matrix.loc.factories);

        step.heavy.factories = step.heavy.factories.add(refineries);
        step.light.factories = step.light.factories.add(hocPlants);
        step.petrol.factories = step.petrol.factories.add(locPlants);
      }
    }
    return step;
  }

  /** Calculate number of refineries and heavy-to-light plants required for petrol, excess light */
  public static calculateLightAndPetrol(step: OilSteps, matrix: OilMatrix): OilSteps {
    if (step.petrol.items.n > 0) {
      if (step.petrol.surplus >= step.petrol.items) {
        // Already producing enough petroleum, subtract from surplus
        step.petrol.surplus = step.petrol.surplus.sub(step.petrol.items);
      } else {
        // Subtract any surplus from what is required
        const required = step.petrol.items.sub(step.petrol.surplus);
        step.petrol.surplus = new Fraction(0);
        // Refineries required for petrol, refinery output only
        const refineries = required.div(matrix.oil.petrol);
        // Heavy-to-light plants required for light
        const hocPlants = refineries.mul(matrix.hoc.factories);

        step.heavy.factories = step.heavy.factories.add(refineries);
        step.light.factories = step.light.factories.add(hocPlants);
        step.light.surplus = step.light.surplus.add(
          refineries.mul(matrix.hoc.max)
        );
      }
    }

    return step;
  }

  /** Calculate conversion of surplus light oil to fuel */
  public static calculateSurplusLightToFuel(step: OilSteps, matrix: OilMatrix): OilSteps {
    step.fuelRequired = step.fuel.items;
    const lightRequired = step.fuelRequired
      .div(matrix.ltf.output)
      .mul(matrix.ltf.input);
    if (step.light.surplus >= lightRequired) {
      // Already producing enough light oil, subtract from surplus
      step.light.surplus = step.light.surplus.sub(lightRequired);
      step.fuel.factories = step.fuelRequired.div(matrix.ltf.output);
    } else {
      // Subtract any surplus
      const newFuelRequired = lightRequired
        .sub(step.light.surplus)
        .mul(matrix.ltf.output)
        .div(matrix.ltf.input);
      step.light.surplus = new Fraction(0);
      step.fuel.factories = step.fuelRequired
        .sub(newFuelRequired)
        .div(matrix.ltf.output);
      step.fuelRequired = newFuelRequired;
    }
    return step;
  }

  /** Calculate conversion of surplus petroleum gas to fuel */
  public static calculateSurplusPetrolToFuel(
    step: OilSteps,
    matrix: OilMatrix
  ): OilSteps {
    const petrolRequired = step.fuelRequired
      .div(matrix.ptf.output)
      .mul(matrix.ptf.input);
    if (step.petrol.surplus >= petrolRequired) {
      // Already producing enough petrol, subtract from surplus
      step.petrol.surplus = step.petrol.surplus.sub(petrolRequired);
      step.fuelPetrol.factories = step.fuelRequired.div(matrix.ptf.output);
    } else {
      // Subtract any surplus
      const newFuelRequired = petrolRequired
        .sub(step.petrol.surplus)
        .mul(matrix.ptf.output)
        .div(matrix.ptf.input);
      step.petrol.surplus = new Fraction(0);
      step.fuelPetrol.factories = step.fuelRequired
        .sub(newFuelRequired)
        .div(matrix.ptf.output);
      step.fuelRequired = newFuelRequired;
    }

    return step;
  }

  /** Calculate number of refineries and heavy-to-light plants required for combined light-to-fuel/petrol-to-fuel */
  public static calculateFuel(step: OilSteps, matrix: OilMatrix): OilSteps {
    // Refineries required for fuel
    const refineries = step.fuelRequired.div(matrix.ptf.max);
    // Heavy-to-light plants required for light
    const hocPlants = refineries.mul(matrix.hoc.factories);
    // Light-to-fuel plants required for fuel
    const ltfPlants = refineries.mul(matrix.ltf.factories);
    // Petrol-to-fuel plants required for fuel
    const ptfPlants = refineries.mul(matrix.ptf.factories);

    step.heavy.factories = step.heavy.factories.add(refineries);
    step.light.factories = step.light.factories.add(hocPlants);
    step.fuel.factories = step.fuel.factories.add(ltfPlants);
    step.fuelPetrol.factories = step.fuelPetrol.factories.add(ptfPlants);

    return step;
  }

  /** Calculate number of items output via oil processes */
  public static calculateItems(step: OilSteps, matrix: OilMatrix): OilSteps {
    // 1) From refineries
    step.heavy.items = step.heavy.factories.mul(matrix.oil.heavy);
    step.light.items = step.heavy.factories.mul(matrix.oil.light);
    step.petrol.items = step.heavy.factories.mul(matrix.oil.petrol);
    // 2) From cracking
    step.light.items = step.light.items.add(
      step.light.factories.mul(matrix.hoc.output)
    );
    step.petrol.items = step.petrol.items.add(
      step.petrol.factories.mul(matrix.loc.output)
    );

    return step;
  }

  /** Calculate inputs (crude, water, etc) */
  public static calculateInputs(
    step: OilSteps,
    matrix: OilMatrix,
    steps: Step[],
    settings: RecipeState,
    factors: Entities<Factors>,
    belt: ItemId,
    data: DatasetState
  ): OilSteps {
    // Calculate refinery inputs
    for (const ingredient of Object.keys(matrix.oil.recipe.in)) {
      if (ingredient !== ItemId.HeavyOil) {
        RateUtility.addStepsFor(
          ingredient as ItemId,
          step.heavy.factories.mul(matrix.oil.recipe.in[ingredient]),
          steps,
          settings,
          factors,
          belt,
          matrix.oil.recipe.id,
          data
        );
      }
    }

    // Calculate cracking inputs
    const hocWater = step.light.factories.mul(
      matrix.hoc.recipe.in[ItemId.Water]
    );
    const locWater = step.petrol.factories.mul(
      matrix.loc.recipe.in[ItemId.Water]
    );
    RateUtility.addStepsFor(
      ItemId.Water,
      hocWater.add(locWater),
      steps,
      settings,
      factors,
      belt,
      matrix.oil.recipe.id,
      data
    );

    return step;
  }

  /** Scale out factories based on speed factors */
  public static calculateFactories(
    step: OilSteps,
    matrix: OilMatrix,
    factors: Entities<Factors>
  ): OilSteps {
    step.heavy.factories = step.heavy.factories
      .mul(matrix.oil.recipe.time)
      .div(factors[matrix.oil.recipe.id].speed);
    step.light.factories = step.light.factories
      .mul(matrix.hoc.recipe.time)
      .div(factors[matrix.hoc.recipe.id].speed);
    step.petrol.factories = step.petrol.factories
      .mul(matrix.loc.recipe.time)
      .div(factors[matrix.loc.recipe.id].speed);
    if (step.fuel) {
      step.fuel.factories = step.fuel.factories
        .mul(matrix.ltf.recipe.time)
        .div(factors[step.fuel.settings.recipeId].speed);
    }
    if (step.fuelPetrol) {
      step.fuelPetrol.factories = step.fuelPetrol.factories
        .mul(matrix.ptf.recipe.time)
        .div(factors[step.fuelPetrol.settings.recipeId].speed);
    }

    return step;
  }

  /** Calculate and add steps for required oil processing */
  public static addOilSteps(
    oilRecipeId: RecipeId,
    steps: Step[],
    settings: RecipeState,
    factors: Entities<Factors>,
    belt: ItemId,
    data: DatasetState
  ): Step[] {
    if (
      oilRecipeId === RecipeId.BasicOilProcessing || // Already handled with basic recipes
      steps.every((s) => OIL_ITEM.indexOf(s.itemId) === -1) // No matching oil products found in steps
    ) {
      return steps;
    }

    const includeFuel = steps.some(
      (s) => s.itemId === ItemId.SolidFuel && s.items.n > 0
    );
    const matrix = this.getOilMatrix(oilRecipeId, includeFuel, factors, data);
    let step = this.getOilSteps(steps, matrix, settings);
    step = this.calculateHeavyOil(step, matrix);
    step = this.calculateLightOil(step, matrix);
    step = this.tryCalculateLightToFuel(step, matrix);

    if (!includeFuel || step.fuel.factories.n > 0) {
      // Fuel is satisfied, move on to petroleum
      step = this.calculatePetroleumGas(step, matrix);
    } else {
      // Fuel was not satisfied above
      step = this.calculateLightAndPetrol(step, matrix);
      step = this.calculateSurplusLightToFuel(step, matrix);

      if (step.fuelRequired.n > 0) {
        // Fuel still not satisfied, need to convert petrol to fuel
        step.fuelPetrol = {
          itemId: null,
          items: null,
          factories: new Fraction(0),
          settings: settings[matrix.ptf.recipe.id],
        };
        step.fuelPetrol.settings.recipeId = matrix.ptf.recipe.id;
        steps.push(step.fuelPetrol);

        step = this.calculateSurplusPetrolToFuel(step, matrix);

        if (step.fuelRequired.n > 0) {
          step = this.calculateFuel(step, matrix);
        }
      }
    }

    step = this.calculateItems(step, matrix);
    step = this.calculateInputs(
      step,
      matrix,
      steps,
      settings,
      factors,
      belt,
      data
    );
    step = this.calculateFactories(step, matrix, factors);

    return steps;
  }
}

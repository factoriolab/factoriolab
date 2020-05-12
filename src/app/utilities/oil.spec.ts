import Fraction from 'fraction.js';

import * as mocks from 'src/mocks';
import { RecipeId, ItemId, Step } from '~/models';
import * as Recipe from '~/store/recipe';
import { OilUtility } from './oil';

/** These tests check basic functionality, not specific math results. */
describe('OilUtility', () => {
  const matrix = OilUtility.getMatrix(
    RecipeId.AdvancedOilProcessing,
    true,
    mocks.RecipeFactors,
    mocks.Data
  );

  describe('getProductionData', () => {
    it('should return oil processing info', () => {
      const result = OilUtility.getProductionData(
        RecipeId.AdvancedOilProcessing,
        mocks.RecipeFactors,
        mocks.Data
      );
      expect(result.recipe).toBeTruthy();
      expect(result.heavy.n).toBeGreaterThan(0);
      expect(result.light.n).toBeGreaterThan(0);
      expect(result.petrol.n).toBeGreaterThan(0);
    });

    it('should account for heavy input to coal liquefaction', () => {
      const result = OilUtility.getProductionData(
        RecipeId.CoalLiquefaction,
        mocks.RecipeFactors,
        mocks.Data
      );
      expect(result.recipe).toBeTruthy();
      expect(result.heavy.n).toBeGreaterThan(0);
      expect(result.light.n).toBeGreaterThan(0);
      expect(result.petrol.n).toBeGreaterThan(0);
      expect(result.heavy).toBeLessThan(
        mocks.Data.recipeEntities[RecipeId.CoalLiquefaction].out[
          ItemId.HeavyOil
        ]
      );
    });
  });

  describe('getConversionData', () => {
    it('should return conversion info', () => {
      const result = OilUtility.getConversionData(
        RecipeId.HeavyOilCracking,
        ItemId.HeavyOil,
        ItemId.LightOil,
        new Fraction(1),
        new Fraction(1),
        mocks.RecipeFactors,
        mocks.Data
      );
      expect(result.recipe).toBeTruthy();
      expect(result.input.n).toBeGreaterThan(0);
      expect(result.output.n).toBeGreaterThan(0);
      expect(result.factories.n).toBeGreaterThan(0);
      expect(result.max.n).toBeGreaterThan(0);
    });
  });

  describe('getMatrix', () => {
    it('should return a matrix of processing info', () => {
      const result = OilUtility.getMatrix(
        RecipeId.AdvancedOilProcessing,
        true,
        mocks.RecipeFactors,
        mocks.Data
      );
      expect(result.oil).toBeTruthy();
      expect(result.hoc).toBeTruthy();
      expect(result.loc).toBeTruthy();
      expect(result.ltf).toBeTruthy();
      expect(result.ptf).toBeTruthy();
    });

    it('should exclude fuel when specified', () => {
      const result = OilUtility.getMatrix(
        RecipeId.AdvancedOilProcessing,
        false,
        mocks.RecipeFactors,
        mocks.Data
      );
      expect(result.oil).toBeTruthy();
      expect(result.hoc).toBeTruthy();
      expect(result.loc).toBeTruthy();
      expect(result.ltf).toBeFalsy();
      expect(result.ptf).toBeFalsy();
    });
  });

  describe('getStep', () => {
    it('should find a step', () => {
      const steps: Step[] = [
        {
          itemId: ItemId.HeavyOil,
          recipeId: null,
          items: new Fraction(1),
          settings: {},
        },
      ];
      const result = OilUtility.getStep(
        ItemId.HeavyOil,
        RecipeId.AdvancedOilProcessing,
        steps,
        mocks.RecipeSettingsEntities
      );
      expect(result.surplus).toEqual(new Fraction(0));
      expect(result.recipeId).toEqual(RecipeId.AdvancedOilProcessing);
    });

    it('should create a step', () => {
      const steps = [];
      const result = OilUtility.getStep(
        ItemId.HeavyOil,
        RecipeId.AdvancedOilProcessing,
        steps,
        mocks.RecipeSettingsEntities
      );
      expect(steps.length).toEqual(1);
      expect(result.surplus).toEqual(new Fraction(0));
      expect(result.recipeId).toEqual(RecipeId.AdvancedOilProcessing);
    });
  });

  describe('getSteps', () => {
    it('should create steps for oil products', () => {
      const steps = [];
      const result = OilUtility.getSteps(
        steps,
        matrix,
        mocks.RecipeSettingsEntities
      );
      expect(steps.length).toEqual(4);
      expect(result.heavy).toBeTruthy();
      expect(result.light).toBeTruthy();
      expect(result.petrol).toBeTruthy();
      expect(result.fuel).toBeTruthy();
    });

    it('should exclude oil when specified', () => {
      const steps = [];
      const noFuelMatrix = OilUtility.getMatrix(
        RecipeId.AdvancedOilProcessing,
        false,
        mocks.RecipeFactors,
        mocks.Data
      );
      const result = OilUtility.getSteps(
        steps,
        noFuelMatrix,
        mocks.RecipeSettingsEntities
      );
      expect(steps.length).toEqual(3);
      expect(result.heavy).toBeTruthy();
      expect(result.light).toBeTruthy();
      expect(result.petrol).toBeTruthy();
      expect(result.fuel).toBeFalsy();
    });
  });

  describe('calculateHeavyOil', () => {
    it('should skip if no heavy required', () => {
      const step: any = {
        heavy: { items: new Fraction(0), factories: null },
      };
      OilUtility.calculateHeavyOil(step, matrix);
      expect(step.heavy.factories).toBeNull();
    });

    it('should calculate for required heavy', () => {
      const step: any = {
        heavy: {
          items: new Fraction(1),
          factories: new Fraction(0),
          settings: {},
        },
        light: { surplus: new Fraction(0) },
      };
      OilUtility.calculateHeavyOil(step, matrix);
      expect(step.light.surplus.n).toBeGreaterThan(0);
      expect(step.heavy.factories.n).toBeGreaterThan(0);
    });
  });

  describe('calculateLightOil', () => {
    it('should only calculate petrol surplus if no light required', () => {
      const step: any = {
        heavy: { factories: new Fraction(1) },
        light: { items: new Fraction(0), factories: null },
        petrol: { surplus: new Fraction(0) },
      };
      OilUtility.calculateLightOil(step, matrix);
      expect(step.light.factories).toBeNull();
      expect(step.petrol.surplus.n).toBeGreaterThan(0);
    });

    it('should subtract from surplus if sufficient', () => {
      const step: any = {
        heavy: { factories: new Fraction(0) },
        light: {
          items: new Fraction(1),
          surplus: new Fraction(2),
          settings: {},
        },
        petrol: { surplus: new Fraction(0) },
      };
      OilUtility.calculateLightOil(step, matrix);
      expect(step.light.surplus).toEqual(new Fraction(1));
    });

    it('should calculate for required light', () => {
      const step: any = {
        heavy: { factories: new Fraction(0) },
        light: {
          items: new Fraction(2),
          surplus: new Fraction(1),
          factories: new Fraction(0),
          settings: {},
        },
        petrol: { surplus: new Fraction(0) },
      };
      OilUtility.calculateLightOil(step, matrix);
      expect(step.light.surplus).toEqual(new Fraction(0));
      expect(step.heavy.factories.n).toBeGreaterThan(0);
      expect(step.light.factories.n).toBeGreaterThan(0);
      expect(step.petrol.surplus.n).toBeGreaterThan(0);
    });
  });

  describe('tryCalculateLightToFuel', () => {
    it('should skip if no fuel step specified', () => {
      const step: any = { fuel: null };
      OilUtility.tryCalculateLightToFuel(step, matrix);
      expect(step.fuel).toBeNull();
    });

    it('should skip if no fuel required', () => {
      const step: any = { fuel: { items: new Fraction(0), factories: null } };
      OilUtility.tryCalculateLightToFuel(step, matrix);
      expect(step.fuel.factories).toBeNull();
    });

    it('should subtract from surplus if sufficient', () => {
      const step: any = {
        light: { surplus: new Fraction(20) },
        fuel: {
          items: new Fraction(1),
          factories: new Fraction(0),
          settings: {},
        },
      };
      OilUtility.tryCalculateLightToFuel(step, matrix);
      expect(step.light.surplus).toEqual(new Fraction(10));
      expect(step.fuel.factories.n).toBeGreaterThan(0);
    });

    it('should skip if excess petrol is produced', () => {
      const step: any = {
        light: { surplus: new Fraction(10) },
        fuel: {
          items: new Fraction(2),
          factories: new Fraction(0),
          settings: {},
        },
        petrol: { surplus: new Fraction(0) },
      };
      OilUtility.tryCalculateLightToFuel(step, matrix);
      expect(step.light.surplus).toEqual(new Fraction(10));
      expect(step.fuel.factories).toEqual(new Fraction(0));
      expect(step.petrol.surplus).toEqual(new Fraction(0));
    });

    it('should calculate for required fuel', () => {
      const step: any = {
        heavy: { factories: new Fraction(0) },
        light: { surplus: new Fraction(10), factories: new Fraction(0) },
        fuel: {
          items: new Fraction(2),
          factories: new Fraction(0),
          settings: {},
        },
        petrol: { items: new Fraction(1000), surplus: new Fraction(0) },
      };
      OilUtility.tryCalculateLightToFuel(step, matrix);
      expect(step.light.surplus).toEqual(new Fraction(0));
      expect(step.heavy.factories.n).toBeGreaterThan(0);
      expect(step.light.factories.n).toBeGreaterThan(0);
      expect(step.fuel.factories.n).toBeGreaterThan(0);
      expect(step.petrol.surplus.n).not.toEqual(new Fraction(1000));
    });
  });

  describe('calculatePetroleumGas', () => {
    it('should skip if no petrol is required', () => {
      const step: any = {
        heavy: { factories: null },
        petrol: { items: new Fraction(0) },
      };
      OilUtility.calculatePetroleumGas(step, matrix);
      expect(step.heavy.factories).toBeNull();
    });

    it('should subtract from surplus if sufficient', () => {
      const step: any = {
        petrol: {
          items: new Fraction(1),
          surplus: new Fraction(2),
          settings: {},
        },
      };
      OilUtility.calculatePetroleumGas(step, matrix);
      expect(step.petrol.surplus).toEqual(new Fraction(1));
    });

    it('should calculate for required petrol', () => {
      const step: any = {
        heavy: { factories: new Fraction(0) },
        light: { factories: new Fraction(0) },
        petrol: {
          items: new Fraction(2),
          surplus: new Fraction(1),
          factories: new Fraction(0),
          settings: {},
        },
      };
      OilUtility.calculatePetroleumGas(step, matrix);
      expect(step.petrol.surplus).toEqual(new Fraction(0));
      expect(step.heavy.factories.n).toBeGreaterThan(0);
      expect(step.light.factories.n).toBeGreaterThan(0);
      expect(step.petrol.factories.n).toBeGreaterThan(0);
    });
  });

  describe('calculateLightAndPetrol', () => {
    it('should skip if no petrol is required', () => {
      const step: any = {
        heavy: { factories: null },
        petrol: { items: new Fraction(0) },
      };
      OilUtility.calculateLightAndPetrol(step, matrix);
      expect(step.heavy.factories).toBeNull();
    });

    it('should subtract from surplus if sufficient', () => {
      const step: any = {
        petrol: {
          items: new Fraction(1),
          surplus: new Fraction(2),
          settings: {},
        },
      };
      OilUtility.calculateLightAndPetrol(step, matrix);
      expect(step.petrol.surplus).toEqual(new Fraction(1));
    });

    it('should calculate for required petrol', () => {
      const step: any = {
        heavy: { factories: new Fraction(0) },
        light: { factories: new Fraction(0), surplus: new Fraction(0) },
        petrol: {
          items: new Fraction(2),
          surplus: new Fraction(1),
          factories: new Fraction(0),
          settings: {},
        },
      };
      OilUtility.calculateLightAndPetrol(step, matrix);
      expect(step.petrol.surplus).toEqual(new Fraction(0));
      expect(step.heavy.factories.n).toBeGreaterThan(0);
      expect(step.light.factories.n).toBeGreaterThan(0);
      expect(step.light.surplus.n).toBeGreaterThan(0);
      expect(step.petrol.factories).toEqual(new Fraction(0));
    });
  });

  describe('calculateSurplusLightToFuel', () => {
    it('should handle ignored fuel step', () => {
      const step: any = {
        fuelRequired: new Fraction(0),
        light: { surplus: new Fraction(20) },
        fuel: {
          items: new Fraction(1),
          factories: new Fraction(0),
          settings: { ignore: true },
        },
      };
      OilUtility.calculateSurplusLightToFuel(step, matrix);
      expect(step.light.surplus).toEqual(new Fraction(20));
      expect(step.fuel.factories).toEqual(new Fraction(0));
      expect(step.fuelRequired).toEqual(new Fraction(0));
    });

    it('should subtract from surplus if sufficient', () => {
      const step: any = {
        fuelRequired: new Fraction(0),
        light: { surplus: new Fraction(20) },
        fuel: {
          items: new Fraction(1),
          factories: new Fraction(0),
          settings: {},
        },
      };
      OilUtility.calculateSurplusLightToFuel(step, matrix);
      expect(step.light.surplus).toEqual(new Fraction(10));
      expect(step.fuel.factories.n).toBeGreaterThan(0);
      expect(step.fuelRequired.n).toBeGreaterThan(0);
    });

    it('should calculate for required fuel', () => {
      const step: any = {
        fuelRequired: new Fraction(0),
        light: { surplus: new Fraction(10) },
        fuel: {
          items: new Fraction(2),
          factories: new Fraction(0),
          settings: {},
        },
      };
      OilUtility.calculateSurplusLightToFuel(step, matrix);
      expect(step.light.surplus).toEqual(new Fraction(0));
      expect(step.fuel.factories.n).toBeGreaterThan(0);
      expect(step.fuelRequired.n).toBeGreaterThan(0);
    });
  });

  describe('calculateSurplusPetrolToFuel', () => {
    it('should subtract from surplus if sufficient', () => {
      const step: any = {
        fuelRequired: new Fraction(1),
        petrol: { surplus: new Fraction(40) },
        fuelPetrol: { factories: new Fraction(0) },
      };
      OilUtility.calculateSurplusPetrolToFuel(step, matrix);
      expect(step.petrol.surplus).toEqual(new Fraction(20));
      expect(step.fuelPetrol.factories.n).toBeGreaterThan(0);
      expect(step.fuelRequired).toEqual(new Fraction(0));
    });

    it('should calculate for required fuel', () => {
      const step: any = {
        fuelRequired: new Fraction(2),
        petrol: { surplus: new Fraction(20) },
        fuelPetrol: { factories: new Fraction(0) },
      };
      OilUtility.calculateSurplusPetrolToFuel(step, matrix);
      expect(step.petrol.surplus).toEqual(new Fraction(0));
      expect(step.fuelPetrol.factories.n).toBeGreaterThan(0);
      expect(step.fuelRequired.n).toBeGreaterThan(0);
    });
  });

  describe('calculateFuel', () => {
    it('should calculate for required fuel', () => {
      const step: any = {
        fuelRequired: new Fraction(1),
        heavy: { factories: new Fraction(0) },
        light: { factories: new Fraction(0) },
        fuel: { factories: new Fraction(0) },
        fuelPetrol: { factories: new Fraction(0) },
      };
      OilUtility.calculateFuel(step, matrix);
      expect(step.heavy.factories.n).toBeGreaterThan(0);
      expect(step.light.factories.n).toBeGreaterThan(0);
      expect(step.fuel.factories.n).toBeGreaterThan(0);
      expect(step.fuelPetrol.factories.n).toBeGreaterThan(0);
    });
  });

  describe('calculateItems', () => {
    it('should calculate total items from factories', () => {
      const step: any = {
        heavy: { items: new Fraction(1), factories: new Fraction(1) },
        light: { items: new Fraction(1), factories: new Fraction(1) },
        petrol: { items: new Fraction(1), factories: new Fraction(1) },
      };
      OilUtility.calculateItems(step, matrix);
      expect(step.heavy.items.n).toBeGreaterThan(0);
      expect(step.light.items.n).toBeGreaterThan(0);
      expect(step.petrol.items.n).toBeGreaterThan(0);
    });

    it('should handle coal liquefaction heavy input', () => {
      const coalMatrix = OilUtility.getMatrix(
        RecipeId.CoalLiquefaction,
        false,
        mocks.RecipeFactors,
        mocks.Data
      );
      const step: any = {
        heavy: { items: new Fraction(1), factories: new Fraction(1) },
        light: { items: new Fraction(1), factories: new Fraction(1) },
        petrol: { items: new Fraction(1), factories: new Fraction(1) },
      };
      OilUtility.calculateItems(step, coalMatrix);
      expect(step.heavy.items.n).toBeGreaterThan(0);
      expect(step.light.items.n).toBeGreaterThan(0);
      expect(step.petrol.items.n).toBeGreaterThan(0);
    });
  });

  describe('calculateInputs', () => {
    it('should calculate inputs for required factories', () => {
      const step: any = {
        heavy: { factories: new Fraction(1) },
        light: { factories: new Fraction(1) },
        petrol: { factories: new Fraction(1) },
      };
      const steps = [];
      OilUtility.calculateInputs(
        step,
        matrix,
        steps,
        mocks.RecipeSettingsEntities,
        mocks.RecipeFactors,
        ItemId.TransportBelt,
        ItemId.Coal,
        mocks.Data
      );
      expect(steps.length).toBeGreaterThan(0);
    });

    it('should handle coal liquefaction heavy input', () => {
      const coalMatrix = OilUtility.getMatrix(
        RecipeId.CoalLiquefaction,
        false,
        mocks.RecipeFactors,
        mocks.Data
      );
      const step: any = {
        heavy: { factories: new Fraction(1) },
        light: { factories: new Fraction(1) },
        petrol: { factories: new Fraction(1) },
      };
      const steps = [];
      OilUtility.calculateInputs(
        step,
        coalMatrix,
        steps,
        mocks.RecipeSettingsEntities,
        mocks.RecipeFactors,
        ItemId.TransportBelt,
        ItemId.Coal,
        mocks.Data
      );
      expect(steps.length).toBeGreaterThan(0);
    });
  });

  describe('calculateFactories', () => {
    it('should calculate factories based on speed factors', () => {
      const step: any = {
        heavy: { factories: new Fraction(1) },
        light: { factories: new Fraction(1) },
        petrol: { factories: new Fraction(1) },
      };
      OilUtility.calculateFactories(step, matrix, mocks.RecipeFactors);
      expect(step.heavy.factories.n).toBeGreaterThan(1);
      expect(step.light.factories.n).toBeGreaterThan(1);
      expect(step.petrol.factories.n).toBeGreaterThan(1);
    });

    it('should calculate factories based on speed factors with fuel products', () => {
      const step: any = {
        heavy: { factories: new Fraction(1) },
        light: { factories: new Fraction(1) },
        petrol: { factories: new Fraction(1) },
        fuel: { factories: new Fraction(1) },
        fuelPetrol: { factories: new Fraction(1) },
      };
      OilUtility.calculateFactories(step, matrix, mocks.RecipeFactors);
      expect(step.heavy.factories.n).toBeGreaterThan(1);
      expect(step.light.factories.n).toBeGreaterThan(1);
      expect(step.petrol.factories.n).toBeGreaterThan(1);
      expect(step.fuel.factories.n).toBeGreaterThan(1);
      expect(step.fuelPetrol.factories.n).toBeGreaterThan(1);
    });
  });

  describe('addSteps', () => {
    it('should do nothing for basic oil processing', () => {
      const steps: Step[] = [
        {
          itemId: ItemId.PetroleumGas,
          recipeId: null,
          items: new Fraction(1),
          settings: {},
        },
      ];
      const result = OilUtility.addSteps(
        RecipeId.BasicOilProcessing,
        steps,
        mocks.RecipeSettingsEntities,
        mocks.RecipeFactors,
        ItemId.TransportBelt,
        ItemId.Coal,
        mocks.Data
      );
      expect(result.length).toEqual(1);
    });

    it('should do nothing if no oil products are found', () => {
      const steps = [];
      const result = OilUtility.addSteps(
        RecipeId.AdvancedOilProcessing,
        steps,
        mocks.RecipeSettingsEntities,
        mocks.RecipeFactors,
        ItemId.TransportBelt,
        ItemId.Coal,
        mocks.Data
      );
      expect(result.length).toEqual(0);
    });

    it('should do nothing if oil products are ignored', () => {
      const steps: Step[] = [
        {
          itemId: ItemId.PetroleumGas,
          recipeId: null,
          items: new Fraction(1),
          factories: new Fraction(0),
          settings: {},
        },
      ];
      const settings = Recipe.recipeReducer(
        mocks.RecipeSettingsEntities,
        new Recipe.IgnoreAction(RecipeId.LightOilCracking)
      );
      const result = OilUtility.addSteps(
        RecipeId.AdvancedOilProcessing,
        steps,
        settings,
        mocks.RecipeFactors,
        ItemId.TransportBelt,
        ItemId.Coal,
        mocks.Data
      );
      expect(result.length).toEqual(1);
    });

    it('should calculate steps for oil products', () => {
      const steps: Step[] = [
        {
          itemId: ItemId.PetroleumGas,
          recipeId: null,
          items: new Fraction(1),
          factories: new Fraction(0),
          settings: {},
        },
      ];
      const result = OilUtility.addSteps(
        RecipeId.AdvancedOilProcessing,
        steps,
        mocks.RecipeSettingsEntities,
        mocks.RecipeFactors,
        ItemId.TransportBelt,
        ItemId.Coal,
        mocks.Data
      );
      expect(result.length).toBeGreaterThan(1);
    });

    it('should calculate steps for fuel', () => {
      const steps: Step[] = [
        {
          itemId: ItemId.SolidFuel,
          recipeId: null,
          items: new Fraction(1),
          factories: new Fraction(0),
          settings: {},
        },
      ];
      const result = OilUtility.addSteps(
        RecipeId.AdvancedOilProcessing,
        steps,
        mocks.RecipeSettingsEntities,
        mocks.RecipeFactors,
        ItemId.TransportBelt,
        ItemId.Coal,
        mocks.Data
      );
      expect(result.length).toBeGreaterThan(1);
    });

    it('should calculate steps for fuel + heavy', () => {
      const steps: Step[] = [
        {
          itemId: ItemId.SolidFuel,
          recipeId: null,
          items: new Fraction(20),
          factories: new Fraction(0),
          settings: {},
        },
        {
          itemId: ItemId.HeavyOil,
          recipeId: null,
          items: new Fraction(100),
          factories: new Fraction(0),
          settings: {},
        },
      ];
      const result = OilUtility.addSteps(
        RecipeId.AdvancedOilProcessing,
        steps,
        mocks.RecipeSettingsEntities,
        mocks.RecipeFactors,
        ItemId.TransportBelt,
        ItemId.Coal,
        mocks.Data
      );
      expect(result.length).toBeGreaterThan(1);
    });
  });
});

import * as Mocks from 'src/mocks';
import { RecipeId, ItemId, Step, Rational } from '~/models';
import * as Recipe from '~/store/recipe';
import { OilUtility } from './oil';

/** These tests check basic functionality, not specific math results. */
describe('OilUtility', () => {
  const matrix = OilUtility.getMatrix(
    RecipeId.AdvancedOilProcessing,
    true,
    Mocks.RecipeFactors,
    Mocks.RationalData
  );

  describe('getProductionData', () => {
    it('should return oil processing info', () => {
      const result = OilUtility.getProductionData(
        RecipeId.AdvancedOilProcessing,
        Mocks.RecipeFactors,
        Mocks.RationalData
      );
      expect(result.recipe).toBeTruthy();
      expect(result.heavy.nonzero()).toBeTrue();
      expect(result.light.nonzero()).toBeTrue();
      expect(result.petrol.nonzero()).toBeTrue();
    });

    it('should account for heavy input to coal liquefaction', () => {
      const result = OilUtility.getProductionData(
        RecipeId.CoalLiquefaction,
        Mocks.RecipeFactors,
        Mocks.RationalData
      );
      expect(result.recipe).toBeTruthy();
      expect(result.heavy.nonzero()).toBeTrue();
      expect(result.light.nonzero()).toBeTrue();
      expect(result.petrol.nonzero()).toBeTrue();
      expect(
        result.heavy.lt(
          Mocks.RationalData.recipeR[RecipeId.CoalLiquefaction].out[
            ItemId.HeavyOil
          ]
        )
      ).toBeTrue();
    });
  });

  describe('getConversionData', () => {
    it('should return conversion info', () => {
      const result = OilUtility.getConversionData(
        RecipeId.HeavyOilCracking,
        ItemId.HeavyOil,
        ItemId.LightOil,
        Rational.one,
        Rational.one,
        Mocks.RecipeFactors,
        Mocks.RationalData
      );
      expect(result.recipe).toBeTruthy();
      expect(result.input.nonzero()).toBeTrue();
      expect(result.output.nonzero()).toBeTrue();
      expect(result.factories.nonzero()).toBeTrue();
      expect(result.max.nonzero()).toBeTrue();
    });
  });

  describe('getMatrix', () => {
    it('should return a matrix of processing info', () => {
      const result = OilUtility.getMatrix(
        RecipeId.AdvancedOilProcessing,
        true,
        Mocks.RecipeFactors,
        Mocks.RationalData
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
        Mocks.RecipeFactors,
        Mocks.RationalData
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
          items: Rational.one,
          settings: {},
        },
      ];
      const result = OilUtility.getStep(
        ItemId.HeavyOil,
        RecipeId.AdvancedOilProcessing,
        steps,
        Mocks.RecipeSettingsEntities
      );
      expect(result.surplus).toEqual(Rational.zero);
      expect(result.recipeId).toEqual(RecipeId.AdvancedOilProcessing);
    });

    it('should create a step', () => {
      const steps = [];
      const result = OilUtility.getStep(
        ItemId.HeavyOil,
        RecipeId.AdvancedOilProcessing,
        steps,
        Mocks.RecipeSettingsEntities
      );
      expect(steps.length).toEqual(1);
      expect(result.surplus).toEqual(Rational.zero);
      expect(result.recipeId).toEqual(RecipeId.AdvancedOilProcessing);
    });
  });

  describe('getSteps', () => {
    it('should create steps for oil products', () => {
      const steps = [];
      const result = OilUtility.getSteps(
        steps,
        matrix,
        Mocks.RecipeSettingsEntities
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
        Mocks.RecipeFactors,
        Mocks.RationalData
      );
      const result = OilUtility.getSteps(
        steps,
        noFuelMatrix,
        Mocks.RecipeSettingsEntities
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
        heavy: { items: Rational.zero, factories: null },
      };
      OilUtility.calculateHeavyOil(step, matrix);
      expect(step.heavy.factories).toBeNull();
    });

    it('should calculate for required heavy', () => {
      const step: any = {
        heavy: {
          items: Rational.one,
          factories: Rational.zero,
          settings: {},
        },
        light: { surplus: Rational.zero },
      };
      OilUtility.calculateHeavyOil(step, matrix);
      expect(step.light.surplus.nonzero()).toBeTrue();
      expect(step.heavy.factories.nonzero()).toBeTrue();
    });
  });

  describe('calculateLightOil', () => {
    it('should only calculate petrol surplus if no light required', () => {
      const step: any = {
        heavy: { factories: Rational.one },
        light: { items: Rational.zero, factories: null },
        petrol: { surplus: Rational.zero },
      };
      OilUtility.calculateLightOil(step, matrix);
      expect(step.light.factories).toBeNull();
      expect(step.petrol.surplus.nonzero()).toBeTrue();
    });

    it('should subtract from surplus if sufficient', () => {
      const step: any = {
        heavy: { factories: Rational.zero },
        light: {
          items: Rational.one,
          surplus: Rational.two,
          settings: {},
        },
        petrol: { surplus: Rational.zero },
      };
      OilUtility.calculateLightOil(step, matrix);
      expect(step.light.surplus).toEqual(Rational.one);
    });

    it('should calculate for required light', () => {
      const step: any = {
        heavy: { factories: Rational.zero },
        light: {
          items: Rational.two,
          surplus: Rational.one,
          factories: Rational.zero,
          settings: {},
        },
        petrol: { surplus: Rational.zero },
      };
      OilUtility.calculateLightOil(step, matrix);
      expect(step.light.surplus).toEqual(Rational.zero);
      expect(step.heavy.factories.nonzero()).toBeTrue();
      expect(step.light.factories.nonzero()).toBeTrue();
      expect(step.petrol.surplus.nonzero()).toBeTrue();
    });
  });

  describe('tryCalculateLightToFuel', () => {
    it('should skip if no fuel step specified', () => {
      const step: any = { fuel: null };
      OilUtility.tryCalculateLightToFuel(step, matrix);
      expect(step.fuel).toBeNull();
    });

    it('should skip if no fuel required', () => {
      const step: any = { fuel: { items: Rational.zero, factories: null } };
      OilUtility.tryCalculateLightToFuel(step, matrix);
      expect(step.fuel.factories).toBeNull();
    });

    it('should subtract from surplus if sufficient', () => {
      const step: any = {
        light: { surplus: new Rational(BigInt(20)) },
        fuel: {
          items: Rational.one,
          factories: Rational.zero,
          settings: {},
        },
      };
      OilUtility.tryCalculateLightToFuel(step, matrix);
      expect(step.light.surplus).toEqual(new Rational(BigInt(10)));
      expect(step.fuel.factories.nonzero()).toBeTrue();
    });

    it('should skip if excess petrol is produced', () => {
      const step: any = {
        light: { surplus: new Rational(BigInt(10)) },
        fuel: {
          items: Rational.two,
          factories: Rational.zero,
          settings: {},
        },
        petrol: { items: Rational.zero, surplus: Rational.zero },
      };
      OilUtility.tryCalculateLightToFuel(step, matrix);
      expect(step.light.surplus).toEqual(new Rational(BigInt(10)));
      expect(step.fuel.factories).toEqual(Rational.zero);
      expect(step.petrol.surplus).toEqual(Rational.zero);
    });

    it('should calculate for required fuel', () => {
      const step: any = {
        heavy: { factories: Rational.zero },
        light: { surplus: new Rational(BigInt(10)), factories: Rational.zero },
        fuel: {
          items: Rational.two,
          factories: Rational.zero,
          settings: {},
        },
        petrol: { items: new Rational(BigInt(1000)), surplus: Rational.zero },
      };
      OilUtility.tryCalculateLightToFuel(step, matrix);
      expect(step.light.surplus).toEqual(Rational.zero);
      expect(step.heavy.factories.nonzero()).toBeTrue();
      expect(step.light.factories.nonzero()).toBeTrue();
      expect(step.fuel.factories.nonzero()).toBeTrue();
      expect(step.petrol.surplus.eq(new Rational(BigInt(1000)))).toBeFalse();
    });
  });

  describe('calculatePetroleumGas', () => {
    it('should skip if no petrol is required', () => {
      const step: any = {
        heavy: { factories: null },
        petrol: { items: Rational.zero },
      };
      OilUtility.calculatePetroleumGas(step, matrix);
      expect(step.heavy.factories).toBeNull();
    });

    it('should subtract from surplus if sufficient', () => {
      const step: any = {
        petrol: {
          items: Rational.one,
          surplus: Rational.two,
          settings: {},
        },
      };
      OilUtility.calculatePetroleumGas(step, matrix);
      expect(step.petrol.surplus).toEqual(Rational.one);
    });

    it('should calculate for required petrol', () => {
      const step: any = {
        heavy: { factories: Rational.zero },
        light: { factories: Rational.zero },
        petrol: {
          items: Rational.two,
          surplus: Rational.one,
          factories: Rational.zero,
          settings: {},
        },
      };
      OilUtility.calculatePetroleumGas(step, matrix);
      expect(step.petrol.surplus).toEqual(Rational.zero);
      expect(step.heavy.factories.nonzero()).toBeTrue();
      expect(step.light.factories.nonzero()).toBeTrue();
      expect(step.petrol.factories.nonzero()).toBeTrue();
    });
  });

  describe('calculateLightAndPetrol', () => {
    it('should skip if no petrol is required', () => {
      const step: any = {
        heavy: { factories: null },
        petrol: { items: Rational.zero },
      };
      OilUtility.calculateLightAndPetrol(step, matrix);
      expect(step.heavy.factories).toBeNull();
    });

    it('should subtract from surplus if sufficient', () => {
      const step: any = {
        petrol: {
          items: Rational.one,
          surplus: Rational.two,
          settings: {},
        },
      };
      OilUtility.calculateLightAndPetrol(step, matrix);
      expect(step.petrol.surplus).toEqual(Rational.one);
    });

    it('should calculate for required petrol', () => {
      const step: any = {
        heavy: { factories: Rational.zero },
        light: { factories: Rational.zero, surplus: Rational.zero },
        petrol: {
          items: Rational.two,
          surplus: Rational.one,
          factories: Rational.zero,
          settings: {},
        },
      };
      OilUtility.calculateLightAndPetrol(step, matrix);
      expect(step.petrol.surplus).toEqual(Rational.zero);
      expect(step.heavy.factories.nonzero()).toBeTrue();
      expect(step.light.factories.nonzero()).toBeTrue();
      expect(step.light.surplus.nonzero()).toBeTrue();
      expect(step.petrol.factories).toEqual(Rational.zero);
    });
  });

  describe('calculateSurplusLightToFuel', () => {
    it('should handle ignored fuel step', () => {
      const step: any = {
        fuelRequired: Rational.zero,
        light: { surplus: new Rational(BigInt(20)) },
        fuel: {
          items: Rational.one,
          factories: Rational.zero,
          settings: { ignore: true },
        },
      };
      OilUtility.calculateSurplusLightToFuel(step, matrix);
      expect(step.light.surplus).toEqual(new Rational(BigInt(20)));
      expect(step.fuel.factories).toEqual(Rational.zero);
      expect(step.fuelRequired).toEqual(Rational.zero);
    });

    it('should subtract from surplus if sufficient', () => {
      const step: any = {
        fuelRequired: Rational.zero,
        light: { surplus: new Rational(BigInt(20)) },
        fuel: {
          items: Rational.one,
          factories: Rational.zero,
          settings: {},
        },
      };
      OilUtility.calculateSurplusLightToFuel(step, matrix);
      expect(step.light.surplus).toEqual(new Rational(BigInt(10)));
      expect(step.fuel.factories.nonzero()).toBeTrue();
      expect(step.fuelRequired.nonzero()).toBeTrue();
    });

    it('should calculate for required fuel', () => {
      const step: any = {
        fuelRequired: Rational.zero,
        light: { surplus: new Rational(BigInt(10)) },
        fuel: {
          items: Rational.two,
          factories: Rational.zero,
          settings: {},
        },
      };
      OilUtility.calculateSurplusLightToFuel(step, matrix);
      expect(step.light.surplus).toEqual(Rational.zero);
      expect(step.fuel.factories.nonzero()).toBeTrue();
      expect(step.fuelRequired.nonzero()).toBeTrue();
    });
  });

  describe('calculateSurplusPetrolToFuel', () => {
    it('should subtract from surplus if sufficient', () => {
      const step: any = {
        fuelRequired: Rational.one,
        petrol: { surplus: new Rational(BigInt(40)) },
        fuelPetrol: { factories: Rational.zero },
      };
      OilUtility.calculateSurplusPetrolToFuel(step, matrix);
      expect(step.petrol.surplus).toEqual(new Rational(BigInt(20)));
      expect(step.fuelPetrol.factories.nonzero()).toBeTrue();
      expect(step.fuelRequired).toEqual(Rational.zero);
    });

    it('should calculate for required fuel', () => {
      const step: any = {
        fuelRequired: Rational.two,
        petrol: { surplus: new Rational(BigInt(20)) },
        fuelPetrol: { factories: Rational.zero },
      };
      OilUtility.calculateSurplusPetrolToFuel(step, matrix);
      expect(step.petrol.surplus).toEqual(Rational.zero);
      expect(step.fuelPetrol.factories.nonzero()).toBeTrue();
      expect(step.fuelRequired.nonzero()).toBeTrue();
    });
  });

  describe('calculateFuel', () => {
    it('should calculate for required fuel', () => {
      const step: any = {
        fuelRequired: Rational.one,
        heavy: { factories: Rational.zero },
        light: { factories: Rational.zero },
        fuel: { factories: Rational.zero },
        fuelPetrol: { factories: Rational.zero },
      };
      OilUtility.calculateFuel(step, matrix);
      expect(step.heavy.factories.nonzero()).toBeTrue();
      expect(step.light.factories.nonzero()).toBeTrue();
      expect(step.fuel.factories.nonzero()).toBeTrue();
      expect(step.fuelPetrol.factories.nonzero()).toBeTrue();
    });
  });

  describe('calculateItems', () => {
    it('should calculate total items from factories', () => {
      const step: any = {
        heavy: { items: Rational.one, factories: Rational.one },
        light: { items: Rational.one, factories: Rational.one },
        petrol: { items: Rational.one, factories: Rational.one },
      };
      OilUtility.calculateItems(step, matrix);
      expect(step.heavy.items.nonzero()).toBeTrue();
      expect(step.light.items.nonzero()).toBeTrue();
      expect(step.petrol.items.nonzero()).toBeTrue();
    });

    it('should handle coal liquefaction heavy input', () => {
      const coalMatrix = OilUtility.getMatrix(
        RecipeId.CoalLiquefaction,
        false,
        Mocks.RecipeFactors,
        Mocks.RationalData
      );
      const step: any = {
        heavy: { items: Rational.one, factories: Rational.one },
        light: { items: Rational.one, factories: Rational.one },
        petrol: { items: Rational.one, factories: Rational.one },
      };
      OilUtility.calculateItems(step, coalMatrix);
      expect(step.heavy.items.nonzero()).toBeTrue();
      expect(step.light.items.nonzero()).toBeTrue();
      expect(step.petrol.items.nonzero()).toBeTrue();
    });
  });

  describe('calculateInputs', () => {
    it('should calculate inputs for required factories', () => {
      const step: any = {
        heavy: { factories: Rational.one },
        light: { factories: Rational.one },
        petrol: { factories: Rational.one },
      };
      const steps = [];
      OilUtility.calculateInputs(
        step,
        matrix,
        steps,
        Mocks.RecipeSettingsEntities,
        Mocks.RecipeFactors,
        ItemId.Coal,
        Mocks.RationalData
      );
      expect(steps.length).toBeGreaterThan(0);
    });

    it('should handle coal liquefaction heavy input', () => {
      const coalMatrix = OilUtility.getMatrix(
        RecipeId.CoalLiquefaction,
        false,
        Mocks.RecipeFactors,
        Mocks.RationalData
      );
      const step: any = {
        heavy: { factories: Rational.one },
        light: { factories: Rational.one },
        petrol: { factories: Rational.one },
      };
      const steps = [];
      OilUtility.calculateInputs(
        step,
        coalMatrix,
        steps,
        Mocks.RecipeSettingsEntities,
        Mocks.RecipeFactors,
        ItemId.Coal,
        Mocks.RationalData
      );
      expect(steps.length).toBeGreaterThan(0);
    });
  });

  describe('calculateFactories', () => {
    it('should calculate factories based on speed factors', () => {
      const step: any = {
        heavy: { factories: Rational.one },
        light: { factories: Rational.one },
        petrol: { factories: Rational.one },
      };
      OilUtility.calculateFactories(step, matrix, Mocks.RecipeFactors);
      expect(step.heavy.factories.gt(Rational.one)).toBeTrue();
      expect(step.light.factories.gt(Rational.one)).toBeTrue();
      expect(step.petrol.factories.gt(Rational.one)).toBeTrue();
    });

    it('should calculate factories based on speed factors with fuel products', () => {
      const step: any = {
        heavy: { factories: Rational.one },
        light: { factories: Rational.one },
        petrol: { factories: Rational.one },
        fuel: { factories: Rational.one },
        fuelPetrol: { factories: Rational.one },
      };
      OilUtility.calculateFactories(step, matrix, Mocks.RecipeFactors);
      expect(step.heavy.factories.gt(Rational.one)).toBeTrue();
      expect(step.light.factories.gt(Rational.one)).toBeTrue();
      expect(step.petrol.factories.gt(Rational.one)).toBeTrue();
      expect(step.fuel.factories.gt(Rational.one)).toBeTrue();
      expect(step.fuelPetrol.factories.gt(Rational.one)).toBeTrue();
    });
  });

  describe('addSteps', () => {
    it('should do nothing for basic oil processing', () => {
      const steps: Step[] = [
        {
          itemId: ItemId.PetroleumGas,
          recipeId: null,
          items: Rational.one,
          settings: {},
        },
      ];
      const result = OilUtility.addSteps(
        RecipeId.BasicOilProcessing,
        steps,
        Mocks.RecipeSettingsEntities,
        Mocks.RecipeFactors,
        ItemId.Coal,
        Mocks.RationalData
      );
      expect(result.length).toEqual(1);
    });

    it('should do nothing if no oil products are found', () => {
      const steps = [];
      const result = OilUtility.addSteps(
        RecipeId.AdvancedOilProcessing,
        steps,
        Mocks.RecipeSettingsEntities,
        Mocks.RecipeFactors,
        ItemId.Coal,
        Mocks.RationalData
      );
      expect(result.length).toEqual(0);
    });

    it('should do nothing if oil products are ignored', () => {
      const steps: Step[] = [
        {
          itemId: ItemId.PetroleumGas,
          recipeId: null,
          items: Rational.one,
          factories: Rational.zero,
          settings: {},
        },
      ];
      const settings = Recipe.recipeReducer(
        Mocks.RecipeSettingsEntities,
        new Recipe.IgnoreAction(RecipeId.LightOilCracking)
      );
      const result = OilUtility.addSteps(
        RecipeId.AdvancedOilProcessing,
        steps,
        settings,
        Mocks.RecipeFactors,
        ItemId.Coal,
        Mocks.RationalData
      );
      expect(result.length).toEqual(1);
    });

    it('should calculate steps for oil products', () => {
      const steps: Step[] = [
        {
          itemId: ItemId.PetroleumGas,
          recipeId: null,
          items: Rational.one,
          factories: Rational.zero,
          settings: {},
        },
      ];
      const result = OilUtility.addSteps(
        RecipeId.AdvancedOilProcessing,
        steps,
        Mocks.RecipeSettingsEntities,
        Mocks.RecipeFactors,
        ItemId.Coal,
        Mocks.RationalData
      );
      expect(result.length).toBeGreaterThan(1);
    });

    it('should calculate steps for fuel', () => {
      const steps: Step[] = [
        {
          itemId: ItemId.SolidFuel,
          recipeId: null,
          items: Rational.one,
          factories: Rational.zero,
          settings: {},
        },
      ];
      const result = OilUtility.addSteps(
        RecipeId.AdvancedOilProcessing,
        steps,
        Mocks.RecipeSettingsEntities,
        Mocks.RecipeFactors,
        ItemId.Coal,
        Mocks.RationalData
      );
      expect(result.length).toBeGreaterThan(1);
    });

    it('should calculate steps for fuel + heavy', () => {
      const steps: Step[] = [
        {
          itemId: ItemId.SolidFuel,
          recipeId: null,
          items: new Rational(BigInt(20)),
          factories: Rational.zero,
          settings: {},
        },
        {
          itemId: ItemId.HeavyOil,
          recipeId: null,
          items: new Rational(BigInt(100)),
          factories: Rational.zero,
          settings: {},
        },
      ];
      const result = OilUtility.addSteps(
        RecipeId.AdvancedOilProcessing,
        steps,
        Mocks.RecipeSettingsEntities,
        Mocks.RecipeFactors,
        ItemId.Coal,
        Mocks.RationalData
      );
      expect(result.length).toBeGreaterThan(1);
    });
  });
});

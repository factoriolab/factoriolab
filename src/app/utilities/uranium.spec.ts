import * as Mocks from 'src/mocks';
import { ItemId, RecipeId, Step, Rational } from '~/models';
import * as Recipe from '~/store/recipe';
import { UraniumUtility } from './uranium';

/** These tests check basic functionality, not specific math results. */
describe('UraniumUtility', () => {
  const matrix = UraniumUtility.getMatrix(
    Mocks.RecipeFactors,
    Mocks.RationalData
  );

  describe('getProductionData', () => {
    it('should return uranium processing info', () => {
      const result = UraniumUtility.getProductionData(
        Mocks.RecipeFactors,
        Mocks.RationalData
      );
      expect(result.recipe).toBeTruthy();
      expect(result.u238.nonzero()).toBeTrue();
      expect(result.u235.nonzero()).toBeTrue();
    });
  });

  describe('getConversionData', () => {
    it('should return kovarex processing info', () => {
      const result = UraniumUtility.getConversionData(
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
      const result = UraniumUtility.getMatrix(
        Mocks.RecipeFactors,
        Mocks.RationalData
      );
      expect(result.prod).toBeTruthy();
      expect(result.conv).toBeTruthy();
    });
  });

  describe('getStep', () => {
    it('should find a step', () => {
      const steps: Step[] = [
        {
          itemId: ItemId.Uranium238,
          recipeId: null,
          items: Rational.one,
          settings: {},
        },
      ];
      const result = UraniumUtility.getStep(
        ItemId.Uranium238,
        RecipeId.UraniumProcessing,
        steps,
        Mocks.RecipeSettingsEntities
      );
      expect(result.surplus.eq(Rational.zero)).toBeTrue();
      expect(result.recipeId).toEqual(RecipeId.UraniumProcessing);
    });

    it('should create a step', () => {
      const steps = [];
      const result = UraniumUtility.getStep(
        ItemId.Uranium238,
        RecipeId.UraniumProcessing,
        steps,
        Mocks.RecipeSettingsEntities
      );
      expect(steps.length).toEqual(1);
      expect(result.surplus.eq(Rational.zero)).toBeTrue();
      expect(result.recipeId).toEqual(RecipeId.UraniumProcessing);
    });
  });

  describe('getSteps', () => {
    it('should create steps for uranium products', () => {
      const steps = [];
      const result = UraniumUtility.getSteps(
        steps,
        matrix,
        Mocks.RecipeSettingsEntities
      );
      expect(steps.length).toEqual(2);
      expect(result.u235).toBeTruthy();
      expect(result.u238).toBeTruthy();
    });
  });

  describe('calculateUranium238', () => {
    it('should skip if no u238 required', () => {
      const step: any = {
        u238: { items: Rational.zero, factories: null },
      };
      UraniumUtility.calculateUranium238(step, matrix);
      expect(step.u238.factories).toBeNull();
    });

    it('should calculate for required u238', () => {
      const step: any = {
        u238: {
          items: Rational.one,
          factories: Rational.zero,
          settings: {},
        },
        u235: { surplus: Rational.zero },
      };
      UraniumUtility.calculateUranium238(step, matrix);
      expect(step.u235.surplus.nonzero()).toBeTrue();
      expect(step.u238.factories.nonzero()).toBeTrue();
    });
  });

  describe('calculateUranium235', () => {
    it('should skip if no u235 required', () => {
      const step: any = {
        u235: { items: Rational.zero, factories: null },
      };
      UraniumUtility.calculateUranium235(step, matrix);
      expect(step.u235.factories).toBeNull();
    });

    it('should subtract from surplus if sufficient', () => {
      const step: any = {
        u235: {
          items: Rational.one,
          surplus: Rational.two,
          settings: {},
        },
      };
      UraniumUtility.calculateUranium235(step, matrix);
      expect(step.u235.surplus).toEqual(Rational.one);
    });

    it('should calculate for required u235', () => {
      const step: any = {
        u238: { factories: Rational.zero },
        u235: {
          items: Rational.two,
          surplus: Rational.one,
          factories: Rational.zero,
          settings: {},
        },
      };
      UraniumUtility.calculateUranium235(step, matrix);
      expect(step.u235.surplus).toEqual(Rational.zero);
      expect(step.u238.factories.nonzero()).toBeTrue();
      expect(step.u235.factories.nonzero()).toBeTrue();
    });
  });

  describe('calculateItems', () => {
    it('should calculate total items from factories', () => {
      const step: any = {
        u238: { items: Rational.zero, factories: Rational.one },
        u235: { items: Rational.zero, factories: Rational.one },
      };
      UraniumUtility.calculateItems(step, matrix);
      expect(step.u238.items.nonzero()).toBeTrue();
      expect(step.u235.items.nonzero()).toBeTrue();
    });
  });

  describe('calculateInputs', () => {
    it('should calculate inputs for required factories', () => {
      const step: any = { u238: { factories: Rational.one } };
      const steps = [];
      UraniumUtility.calculateInputs(
        step,
        matrix,
        steps,
        Mocks.RecipeSettingsEntities,
        Mocks.RecipeFactors,
        ItemId.Coal,
        RecipeId.AdvancedOilProcessing,
        Mocks.RationalData
      );
      expect(steps.length).toBeGreaterThan(0);
    });
  });

  describe('calculateFactories', () => {
    it('should calculate factories based on speed factors', () => {
      const step: any = {
        u238: { factories: Rational.one },
        u235: { factories: Rational.one },
      };
      UraniumUtility.calculateFactories(step, matrix, Mocks.RecipeFactors);
      expect(step.u238.factories.nonzero()).toBeTrue();
      expect(step.u235.factories.nonzero()).toBeTrue();
    });
  });

  describe('addSteps', () => {
    it('should do nothing if no uranium products are found', () => {
      const steps = [];
      const result = UraniumUtility.addSteps(
        steps,
        Mocks.RecipeSettingsEntities,
        Mocks.RecipeFactors,
        ItemId.Coal,
        RecipeId.AdvancedOilProcessing,
        Mocks.RationalData
      );
      expect(result.length).toEqual(0);
    });

    it('should do nothing if uranium products are ignored', () => {
      const steps: Step[] = [
        {
          itemId: ItemId.Uranium235,
          recipeId: null,
          items: Rational.one,
          factories: Rational.zero,
          settings: {},
        },
      ];
      const settings = Recipe.recipeReducer(
        Mocks.RecipeSettingsEntities,
        new Recipe.IgnoreAction(RecipeId.KovarexEnrichmentProcess)
      );
      const result = UraniumUtility.addSteps(
        steps,
        settings,
        Mocks.RecipeFactors,
        ItemId.Coal,
        RecipeId.AdvancedOilProcessing,
        Mocks.RationalData
      );
      expect(result.length).toEqual(1);
    });

    it('should calculate steps for uranium products', () => {
      const steps: Step[] = [
        {
          itemId: ItemId.Uranium235,
          recipeId: null,
          items: Rational.one,
          factories: Rational.zero,
          settings: {},
        },
      ];
      const result = UraniumUtility.addSteps(
        steps,
        Mocks.RecipeSettingsEntities,
        Mocks.RecipeFactors,
        ItemId.Coal,
        RecipeId.AdvancedOilProcessing,
        Mocks.RationalData
      );
      expect(result.length).toBeGreaterThan(1);
    });
  });
});

import Fraction from 'fraction.js';

import * as mocks from 'src/mocks';
import { RateUtility } from './rate';
import { Step, ItemId, RecipeId, CategoryId } from '~/models';

describe('RateUtility', () => {
  describe('addStepsFor', () => {
    const expected = [
      {
        itemId: 'iron-chest',
        items: new Fraction(30),
        factories: new Fraction(15),
        settings: {
          ignore: false,
          lane: 'transport-belt',
          factory: 'assembling-machine-2',
          modules: ['module', 'module'],
          beaconType: 'module',
          beaconCount: 0,
        },
      },
      {
        itemId: 'iron-plate',
        items: new Fraction(240),
        factories: new Fraction(768),
        settings: {
          ignore: false,
          lane: 'transport-belt',
          factory: 'assembling-machine-2',
          modules: ['module', 'module'],
          beaconType: 'module',
          beaconCount: 0,
        },
      },
      {
        itemId: 'iron-ore',
        items: new Fraction(240),
        factories: new Fraction(240),
        settings: {
          ignore: false,
          lane: 'transport-belt',
          factory: 'assembling-machine-2',
          modules: ['module', 'module'],
          beaconType: 'module',
          beaconCount: 0,
        },
      },
    ];

    it('should recursively calculate required steps', () => {
      const steps: Step[] = [];
      RateUtility.addStepsFor(
        mocks.Item2.id,
        new Fraction(30),
        steps,
        mocks.RecipeSettingsEntities,
        mocks.RecipeFactors,
        ItemId.TransportBelt,
        RecipeId.BasicOilProcessing,
        mocks.Data
      );
      expect(steps as any).toEqual(expected as any);
    });

    it('should handle repeated products', () => {
      const steps: Step[] = [];
      RateUtility.addStepsFor(
        mocks.Item2.id,
        new Fraction(15),
        steps,
        mocks.RecipeSettingsEntities,
        mocks.RecipeFactors,
        ItemId.TransportBelt,
        RecipeId.BasicOilProcessing,
        mocks.Data
      );
      RateUtility.addStepsFor(
        mocks.Item2.id,
        new Fraction(15),
        steps,
        mocks.RecipeSettingsEntities,
        mocks.RecipeFactors,
        ItemId.TransportBelt,
        RecipeId.BasicOilProcessing,
        mocks.Data
      );
      expect(steps).toEqual(expected as any);
    });

    it('should handle recipes with specific outputs', () => {
      const steps: Step[] = [];
      RateUtility.addStepsFor(
        mocks.Item2.id,
        new Fraction(30),
        steps,
        mocks.RecipeSettingsEntities,
        mocks.RecipeFactors,
        ItemId.TransportBelt,
        RecipeId.BasicOilProcessing,
        {
          ...mocks.Data,
          ...{
            recipeEntities: {
              ...mocks.Data.recipeEntities,
              ...{
                ['iron-chest']: {
                  id: 'iron-chest',
                  time: 1,
                  in: { 'iron-plate': 16 },
                  out: { 'iron-chest': 2 },
                } as any,
              },
            },
          },
        }
      );
      expect(steps).toEqual(expected as any);
    });

    it('should handle research recipes', () => {
      const steps: Step[] = [];
      RateUtility.addStepsFor(
        mocks.Item2.id,
        new Fraction(30),
        steps,
        mocks.RecipeSettingsEntities,
        mocks.RecipeFactors,
        ItemId.TransportBelt,
        RecipeId.BasicOilProcessing,
        {
          ...mocks.Data,
          ...{
            itemEntities: {
              ...mocks.Data.itemEntities,
              ...{
                ['iron-chest']: {
                  ...mocks.Data.itemEntities['iron-chest'],
                  ...{ category: CategoryId.Research }
                } as any,
              },
            },
          },
        }
      );
      expect(steps).toEqual(expected as any);
    });

    it('should properly set default lane for fluids', () => {
      const steps: Step[] = [];
      RateUtility.addStepsFor(
        ItemId.PetroleumGas,
        new Fraction(30),
        steps,
        {},
        mocks.RecipeFactors,
        ItemId.TransportBelt,
        RecipeId.AdvancedOilProcessing,
        mocks.Data
      );
      expect(steps[0].settings.lane).toEqual(ItemId.Pipe);
    });

    it('should properly mark recipe for oil products when using basic oil processing', () => {
      const steps: Step[] = [
        {
          itemId: ItemId.PetroleumGas,
          items: new Fraction(30),
          settings: {},
        },
      ];
      RateUtility.addStepsFor(
        ItemId.PetroleumGas,
        new Fraction(30),
        steps,
        mocks.RecipeSettingsEntities,
        mocks.RecipeFactors,
        ItemId.TransportBelt,
        RecipeId.BasicOilProcessing,
        mocks.Data
      );
      expect(steps[0].settings.recipeId).toEqual(RecipeId.BasicOilProcessing);
    });

    it('should handle null recipe', () => {
      const steps: Step[] = [];
      RateUtility.addStepsFor(
        ItemId.Uranium235,
        new Fraction(30),
        steps,
        mocks.RecipeSettingsEntities,
        mocks.RecipeFactors,
        ItemId.TransportBelt,
        RecipeId.BasicOilProcessing,
        mocks.Data
      );
      expect(steps).toEqual([
        {
          itemId: ItemId.Uranium235,
          items: new Fraction(30),
          factories: new Fraction(0),
          settings: {
            lane: ItemId.TransportBelt,
          },
        },
      ]);
    });
  });

  describe('calculateLanes', () => {
    it('should skip steps with no items', () => {
      const steps: Step[] = [
        {
          itemId: mocks.Item1.id,
          items: null,
          lanes: null,
          settings: { lane: ItemId.TransportBelt },
        },
      ];
      RateUtility.calculateLanes(steps, mocks.LaneSpeed);
      expect(steps[0].lanes).toBeNull();
    });

    it('should calculate required lanes for steps', () => {
      const steps: Step[] = [
        {
          itemId: mocks.Item1.id,
          items: mocks.LaneSpeed[ItemId.TransportBelt],
          lanes: new Fraction(0),
          settings: { lane: ItemId.TransportBelt },
        },
      ];
      RateUtility.calculateLanes(steps, mocks.LaneSpeed);
      expect(steps[0].lanes).toEqual(new Fraction(1));
    });
  });

  describe('displayRate', () => {
    it('should skip steps with no items', () => {
      const steps: Step[] = [
        {
          itemId: mocks.Item1.id,
          items: null,
          lanes: null,
          settings: { lane: ItemId.TransportBelt },
        },
      ];
      RateUtility.displayRate(steps, 3 as any);
      expect(steps[0].items).toBeNull();
    });

    it('should apply the display rate to the given steps', () => {
      const result = RateUtility.displayRate(
        [{ items: new Fraction(2), surplus: new Fraction(3) }] as any,
        3 as any
      );
      expect(result[0].items).toEqual(new Fraction(6));
      expect(result[0].surplus).toEqual(new Fraction(9));
    });

    it('should apply the display rate to the given steps with no surplus', () => {
      const result = RateUtility.displayRate(
        [{ items: new Fraction(2) }] as any,
        3 as any
      );
      expect(result[0].items).toEqual(new Fraction(6));
      expect(result[0].surplus).toBeFalsy();
    });
  });

  describe('findBasicOilRecipe', () => {
    it('should return null if not using basic oil processing', () => {
      const result = RateUtility.findBasicOilRecipe(
        ItemId.PetroleumGas,
        RecipeId.AdvancedOilProcessing,
        mocks.Data
      );
      expect(result).toBeNull();
    });

    it('should return null for non supported products', () => {
      const result = RateUtility.findBasicOilRecipe(
        ItemId.HeavyOil,
        RecipeId.BasicOilProcessing,
        mocks.Data
      );
      expect(result).toBeNull();
    });

    it('should return basic oil processing for petroleum gas', () => {
      const result = RateUtility.findBasicOilRecipe(
        ItemId.PetroleumGas,
        RecipeId.BasicOilProcessing,
        mocks.Data
      );
      expect(result.id).toEqual(RecipeId.BasicOilProcessing);
    });

    it('should return solid fuel from petroleum for solid fuel', () => {
      const result = RateUtility.findBasicOilRecipe(
        ItemId.SolidFuel,
        RecipeId.BasicOilProcessing,
        mocks.Data
      );
      expect(result.id).toEqual(RecipeId.SolidFuelFromPetroleumGas);
    });
  });
});

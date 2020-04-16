import Fraction from 'fraction.js';

import * as mocks from 'src/mocks';
import { RateUtility } from './rate';
import { Step, ItemId, RecipeId } from '~/models';

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

  describe('displayRate', () => {
    it('should apply the display rate to the given steps', () => {
      const result = RateUtility.displayRate(
        [{ items: new Fraction(2) }] as any,
        3 as any
      );
      expect(result[0].items).toEqual(new Fraction(6));
    });
  });
});

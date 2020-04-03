import Fraction from 'fraction.js';

import * as mocks from 'src/mocks';
import { RateUtility } from './rate';
import { RateType, DisplayRate, Step } from '~/models';

describe('RateUtility', () => {
  const stringValue = 'test';

  describe('toFactories', () => {
    it('should calculate the number of factories required', () => {
      // 4 * 3 = 12, / 2 = 6, / (3 * 1) = 2
      const result = RateUtility.toFactories(
        new Fraction(4),
        new Fraction(3),
        new Fraction(2),
        [new Fraction(3), new Fraction(1)]
      );
      expect(result).toEqual(new Fraction(2));
    });
  });

  describe('toRate', () => {
    it('should calculate the rate from the number of factories', () => {
      // 4 / 2 = 2, * 3 = 6, * (3 * 1) = 18
      const result = RateUtility.toRate(
        new Fraction(4),
        new Fraction(2),
        new Fraction(3),
        [new Fraction(3), new Fraction(1)]
      );
      expect(result).toEqual(new Fraction(18));
    });
  });

  describe('normalizeRate', () => {
    it('should handle RateType.Items', () => {
      // 120 / 60 = 2
      const result = RateUtility.normalizeRate(
        new Fraction(120),
        RateType.Items,
        DisplayRate.PerMinute,
        null,
        null,
        null,
        null,
        null
      );
      expect(result).toEqual(new Fraction(2));
    });

    it('should handle RateType.Lanes with stackable items', () => {
      // 2 * 15 = 30
      const result = RateUtility.normalizeRate(
        new Fraction(2),
        RateType.Lanes,
        null,
        1,
        15,
        null,
        null,
        null
      );
      expect(result).toEqual(new Fraction(30));
    });

    it('should handle RateType.Lanes with fluids', () => {
      // 2 * 100 = 200
      const result = RateUtility.normalizeRate(
        new Fraction(2),
        RateType.Lanes,
        null,
        null,
        null,
        100,
        null,
        null
      );
      expect(result).toEqual(new Fraction(200));
    });

    it('should handle RateType.Wagons with stackable items', () => {
      // 120 / 60 = 2, * 1 = 2, * 40 = 80
      const result = RateUtility.normalizeRate(
        new Fraction(120),
        RateType.Wagons,
        DisplayRate.PerMinute,
        1,
        null,
        null,
        null,
        null
      );
      expect(result).toEqual(new Fraction(80));
    });

    it('should handle RateType.Wagons with fluids', () => {
      // 120 / 60 = 2, * 25000 = 50000
      const result = RateUtility.normalizeRate(
        new Fraction(120),
        RateType.Wagons,
        DisplayRate.PerMinute,
        null,
        null,
        null,
        null,
        null
      );
      expect(result).toEqual(new Fraction(50000));
    });

    it('should handle RateType.Factories with default recipe output', () => {
      // 4 / 2 = 2, * 1 = 2, * (3 * 1) = 6
      const result = RateUtility.normalizeRate(
        new Fraction(4),
        RateType.Factories,
        null,
        null,
        null,
        null,
        { time: 2 } as any,
        [new Fraction(3), new Fraction(1)]
      );
      expect(result).toEqual(new Fraction(6));
    });

    it('should handle RateType.Factories with specific recipe output', () => {
      // 4 / 2 = 2, * 1 = 2, * (3 * 1) = 6
      const result = RateUtility.normalizeRate(
        new Fraction(4),
        RateType.Factories,
        null,
        null,
        null,
        null,
        { id: stringValue, time: 2, out: { [stringValue]: 3 } } as any,
        [new Fraction(3), new Fraction(1)]
      );
      expect(result).toEqual(new Fraction(18));
    });

    it('should handle unknown RateType', () => {
      const result = RateUtility.normalizeRate(
        new Fraction(2),
        null,
        null,
        null,
        null,
        null,
        null,
        null
      );
      expect(result).toEqual(new Fraction(2));
    });
  });

  describe('addStepsFor', () => {
    const expected = [
      {
        itemId: 'iron-chest',
        items: new Fraction(30),
        lanes: new Fraction(2),
        factories: new Fraction(15),
        settings: {
          ignore: false,
          belt: 'transport-belt',
          factory: 'assembling-machine-2',
          modules: ['module', 'module'],
          beaconType: 'module',
          beaconCount: 0
        }
      },
      {
        itemId: 'iron-plate',
        items: new Fraction(240),
        lanes: new Fraction(16),
        factories: new Fraction(768),
        settings: {
          ignore: false,
          belt: 'transport-belt',
          factory: 'assembling-machine-2',
          modules: ['module', 'module'],
          beaconType: 'module',
          beaconCount: 0
        }
      },
      {
        itemId: 'iron-ore',
        items: new Fraction(240),
        lanes: new Fraction(16),
        factories: new Fraction(240),
        settings: {
          ignore: false,
          belt: 'transport-belt',
          factory: 'assembling-machine-2',
          modules: ['module', 'module'],
          beaconType: 'module',
          beaconCount: 0
        }
      }
    ];

    it('should recursively calculate required steps', () => {
      const steps: Step[] = [];
      RateUtility.addStepsFor(
        mocks.Item2.id,
        new Fraction(30),
        mocks.Data.recipes.find(r => r.id === mocks.Item2.id),
        steps,
        mocks.RecipeSettingsEntities,
        mocks.BeltSpeed,
        mocks.RecipeFactors,
        mocks.RecipeEntities
      );
      expect(steps).toEqual(expected);
    });

    it('should handle repeated products', () => {
      const steps: Step[] = [];
      RateUtility.addStepsFor(
        mocks.Item2.id,
        new Fraction(15),
        mocks.Data.recipes.find(r => r.id === mocks.Item2.id),
        steps,
        mocks.RecipeSettingsEntities,
        mocks.BeltSpeed,
        mocks.RecipeFactors,
        mocks.RecipeEntities
      );
      RateUtility.addStepsFor(
        mocks.Item2.id,
        new Fraction(15),
        mocks.Data.recipes.find(r => r.id === mocks.Item2.id),
        steps,
        mocks.RecipeSettingsEntities,
        mocks.BeltSpeed,
        mocks.RecipeFactors,
        mocks.RecipeEntities
      );
      expect(steps).toEqual(expected);
    });

    it('should handle recipes with specific outputs', () => {
      const steps: Step[] = [];
      RateUtility.addStepsFor(
        mocks.Item2.id,
        new Fraction(30),
        {
          id: 'iron-chest',
          time: 1,
          in: { 'iron-plate': 16 },
          out: { 'iron-chest': 2 }
        },
        steps,
        mocks.RecipeSettingsEntities,
        mocks.BeltSpeed,
        mocks.RecipeFactors,
        mocks.RecipeEntities
      );
      expect(steps).toEqual(expected);
    });

    it('should handle null recipe', () => {
      const steps: Step[] = [];
      RateUtility.addStepsFor(
        mocks.Item2.id,
        new Fraction(30),
        null,
        steps,
        mocks.RecipeSettingsEntities,
        mocks.BeltSpeed,
        mocks.RecipeFactors,
        mocks.RecipeEntities
      );
      expect(steps).toEqual([
        {
          itemId: 'iron-chest',
          items: new Fraction(30),
          factories: new Fraction(0),
          settings: null
        }
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

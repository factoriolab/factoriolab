import Fraction from 'fraction.js';

import * as mocks from 'src/mocks';
import { DisplayRate } from '~/models';
import { RateUtility, UraniumUtility, OilUtility } from '~/utilities';
import * as selectors from './products.selectors';

describe('Products Selectors', () => {
  describe('getProducts', () => {
    it('should handle empty/null values', () => {
      const result = selectors.getProducts.projector([], {});
      expect(result.length).toEqual(0);
    });

    it('should return the array of product ids', () => {
      const result = selectors.getProducts.projector(
        mocks.ProductIds,
        mocks.ProductEntities
      );
      expect(result.length).toEqual(mocks.ProductIds.length);
    });
  });

  describe('getProductsByItems', () => {
    it('should handle empty/null values', () => {
      const result = selectors.getProductsByItems.projector([], {});
      expect(result.length).toEqual(0);
    });

    it('should return the array of product ids', () => {
      const result = selectors.getProductsByItems.projector(
        mocks.ProductIds,
        mocks.ProductEntities
      );
      expect(result.length).toEqual(1);
    });
  });

  describe('getProductsByLanes', () => {
    it('should handle empty/null values', () => {
      const result = selectors.getProductsByLanes.projector([], {});
      expect(result.length).toEqual(0);
    });

    it('should return the array of product ids', () => {
      const result = selectors.getProductsByLanes.projector(
        mocks.ProductIds,
        mocks.ProductEntities
      );
      expect(result.length).toEqual(1);
    });
  });

  describe('getProductsByWagons', () => {
    it('should handle empty/null values', () => {
      const result = selectors.getProductsByWagons.projector([], {});
      expect(result.length).toEqual(0);
    });

    it('should return the array of product ids', () => {
      const result = selectors.getProductsByWagons.projector(
        mocks.ProductIds,
        mocks.ProductEntities
      );
      expect(result.length).toEqual(1);
    });
  });

  describe('getProductsByFactories', () => {
    it('should handle empty/null values', () => {
      const result = selectors.getProductsByFactories.projector([], {});
      expect(result.length).toEqual(0);
    });

    it('should return the array of product ids', () => {
      const result = selectors.getProductsByFactories.projector(
        mocks.ProductIds,
        mocks.ProductEntities
      );
      expect(result.length).toEqual(1);
    });
  });

  describe('getNormalizedRatesByItems', () => {
    it('should handle empty/null values', () => {
      const result = selectors.getNormalizedRatesByItems.projector(
        [],
        {},
        null
      );
      expect(Object.keys(result).length).toEqual(0);
    });

    it('should return the rate entities', () => {
      const result = selectors.getNormalizedRatesByItems.projector(
        [mocks.Product1.id],
        mocks.ProductEntities,
        DisplayRate.PerHour
      );
      expect(result[mocks.Product1.id].n).toBeGreaterThan(0);
    });
  });

  describe('getNormalizedRatesByLanes', () => {
    it('should handle empty/null values', () => {
      const result = selectors.getNormalizedRatesByLanes.projector(
        [],
        {},
        {},
        {}
      );
      expect(Object.keys(result).length).toEqual(0);
    });

    it('should return the rate entities', () => {
      const result = selectors.getNormalizedRatesByLanes.projector(
        [mocks.Product2.id],
        mocks.ProductEntities,
        { [mocks.Product2.itemId]: mocks.Settings1 },
        { [mocks.Settings1.lane]: new Fraction(1) }
      );
      expect(result[mocks.Product2.id].n).toBeGreaterThan(0);
    });
  });

  describe('getNormalizedRatesByWagons', () => {
    it('should handle empty/null values', () => {
      const result = selectors.getNormalizedRatesByWagons.projector(
        [],
        {},
        null,
        {}
      );
      expect(Object.keys(result).length).toEqual(0);
    });

    it('should return the rate entities', () => {
      const result = selectors.getNormalizedRatesByWagons.projector(
        [mocks.Product2.id],
        mocks.ProductEntities,
        DisplayRate.PerHour,
        mocks.Data
      );
      expect(result[mocks.Product2.id].n).toBeGreaterThan(0);
    });

    it('should return the rate entities for fluids', () => {
      const result = selectors.getNormalizedRatesByWagons.projector(
        [mocks.Product3.id],
        mocks.ProductEntities,
        DisplayRate.PerHour,
        mocks.Data
      );
      expect(result[mocks.Product3.id].n).toBeGreaterThan(0);
    });
  });

  describe('getNormalizedRatesByFactories', () => {
    it('should handle empty/null values', () => {
      const result = selectors.getNormalizedRatesByFactories.projector(
        [],
        {},
        {},
        {}
      );
      expect(Object.keys(result).length).toEqual(0);
    });

    it('should return the rate entities', () => {
      const result = selectors.getNormalizedRatesByFactories.projector(
        [mocks.Product1.id],
        mocks.ProductEntities,
        {
          [mocks.Product1.itemId]: {
            prod: new Fraction(1),
            speed: new Fraction(1),
          },
        },
        mocks.Data
      );
      expect(result[mocks.Product1.id].n).toBeGreaterThan(0);
    });

    it('should return the rate entities for recipe with specific outputs', () => {
      const result = selectors.getNormalizedRatesByFactories.projector(
        [mocks.Product4.id],
        mocks.ProductEntities,
        {
          [mocks.Product4.itemId]: {
            prod: new Fraction(1),
            speed: new Fraction(1),
          },
        },
        mocks.Data
      );
      expect(result[mocks.Product4.id].n).toBeGreaterThan(0);
    });
  });

  describe('getNormalizedRates', () => {
    it('should handle empty/null values', () => {
      const result = selectors.getNormalizedRates.projector({}, {}, {}, {});
      expect(Object.keys(result).length).toEqual(0);
    });
  });

  describe('getNormalizedSteps', () => {
    it('should handle empty/null values', () => {
      const result = selectors.getNormalizedSteps.projector(
        [],
        {},
        {},
        {},
        null,
        null,
        {}
      );
      expect(Object.keys(result).length).toEqual(0);
    });

    it('should calculate rates using utility method', () => {
      spyOn(RateUtility, 'addStepsFor');
      selectors.getNormalizedSteps.projector(
        [mocks.Product1],
        { [mocks.Product1.id]: new Fraction(1) },
        {},
        {},
        null,
        null,
        {}
      );
      expect(RateUtility.addStepsFor).toHaveBeenCalled();
    });
  });

  describe('getNormalizedStepsWithUranium', () => {
    it('should handle empty/null values', () => {
      const result = selectors.getNormalizedStepsWithUranium.projector(
        [],
        {},
        {},
        null,
        null,
        {}
      );
      expect(Object.keys(result).length).toEqual(0);
    });

    it('should calculate rates using utility method', () => {
      spyOn(UraniumUtility, 'addSteps');
      selectors.getNormalizedStepsWithUranium.projector(
        [],
        {},
        {},
        null,
        null,
        {}
      );
      expect(UraniumUtility.addSteps).toHaveBeenCalled();
    });
  });

  describe('getNormalizedStepsWithOil', () => {
    it('should handle empty/null values', () => {
      const result = selectors.getNormalizedStepsWithOil.projector(
        [],
        {},
        {},
        null,
        null,
        {}
      );
      expect(Object.keys(result).length).toEqual(0);
    });

    it('should calculate rates using utility method', () => {
      spyOn(OilUtility, 'addSteps');
      selectors.getNormalizedStepsWithOil.projector([], {}, {}, null, null, {});
      expect(OilUtility.addSteps).toHaveBeenCalled();
    });
  });

  describe('getNormalizedStepsWithLanes', () => {
    it('should handle empty/null values', () => {
      const result = selectors.getNormalizedStepsWithLanes.projector([], {});
      expect(Object.keys(result).length).toEqual(0);
    });

    it('should calculate rates using utility method', () => {
      spyOn(RateUtility, 'calculateLanes');
      selectors.getNormalizedStepsWithLanes.projector([], {});
      expect(RateUtility.calculateLanes).toHaveBeenCalled();
    });
  });

  describe('getSteps', () => {
    it('should handle empty/null values', () => {
      const result = selectors.getSteps.projector([], null);
      expect(Object.keys(result).length).toEqual(0);
    });

    it('should calculate rates using utility method', () => {
      spyOn(RateUtility, 'displayRate');
      selectors.getSteps.projector([], null);
      expect(RateUtility.displayRate).toHaveBeenCalled();
    });
  });
});

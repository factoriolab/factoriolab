import Fraction from 'fraction.js';

import * as mocks from 'src/mocks';
import {
  DisplayRate,
  ItemId,
  RateType,
  Product,
  RecipeId,
  NEntities,
} from '~/models';
import { RateUtility, UraniumUtility, OilUtility } from '~/utilities';
import { initialSettingsState } from '../settings';
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

  describe('getProductsByBelts', () => {
    it('should handle empty/null values', () => {
      const result = selectors.getProductsByBelts.projector([], {});
      expect(result.length).toEqual(0);
    });

    it('should return the array of product ids', () => {
      const result = selectors.getProductsByBelts.projector(
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

  describe('getNormalizedRatesByBelts', () => {
    it('should handle empty/null values', () => {
      const result = selectors.getNormalizedRatesByBelts.projector(
        [],
        {},
        {},
        {}
      );
      expect(Object.keys(result).length).toEqual(0);
    });

    it('should return the rate entities', () => {
      const result = selectors.getNormalizedRatesByBelts.projector(
        [mocks.Product2.id],
        mocks.ProductEntities,
        { [mocks.Product2.itemId]: mocks.Settings1 },
        { [mocks.Settings1.belt]: new Fraction(1) }
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
        null,
        {}
      );
      expect(Object.keys(result).length).toEqual(0);
    });

    it('should handle no recipe found', () => {
      const result = selectors.getNormalizedRatesByFactories.projector(
        [mocks.Product1.id],
        {
          ...mocks.ProductEntities,
          ...{ [mocks.Product1.id]: { itemId: 'test' } },
        },
        mocks.RecipeFactors,
        null,
        mocks.Data
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
        null,
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
        null,
        mocks.Data
      );
      expect(result[mocks.Product4.id].n).toBeGreaterThan(0);
    });

    it('should handle research products', () => {
      const product: Product = {
        id: 0,
        itemId: ItemId.MiningProductivity,
        rate: 1,
        rateType: RateType.Factories,
      };
      const result = selectors.getNormalizedRatesByFactories.projector(
        [0],
        { [0]: product },
        mocks.RecipeFactors,
        null,
        mocks.Data
      );
      expect(result[0].n).toBeGreaterThan(0);
    });

    it('should handle oil products', () => {
      const products: NEntities<Product> = {
        [0]: {
          id: 0,
          itemId: ItemId.HeavyOil,
          rate: 1,
          rateType: RateType.Factories,
        },
        [1]: {
          id: 1,
          itemId: ItemId.LightOil,
          rate: 1,
          rateType: RateType.Factories,
        },
        [2]: {
          id: 2,
          itemId: ItemId.PetroleumGas,
          rate: 1,
          rateType: RateType.Factories,
        },
        [3]: {
          id: 3,
          itemId: ItemId.SolidFuel,
          rate: 1,
          rateType: RateType.Factories,
        },
      };
      const result = selectors.getNormalizedRatesByFactories.projector(
        Object.keys(products).map((k) => Number(k)),
        products,
        mocks.RecipeFactors,
        RecipeId.AdvancedOilProcessing,
        mocks.Data
      );
      expect(result[0].n).toBeGreaterThan(0);
      expect(result[1].n).toBeGreaterThan(0);
      expect(result[2].n).toBeGreaterThan(0);
      expect(result[3].n).toBeGreaterThan(0);
    });

    it('should handle uranium products', () => {
      const products: NEntities<Product> = {
        [0]: {
          id: 0,
          itemId: ItemId.Uranium238,
          rate: 1,
          rateType: RateType.Factories,
        },
        [1]: {
          id: 1,
          itemId: ItemId.Uranium235,
          rate: 1,
          rateType: RateType.Factories,
        },
      };
      const result = selectors.getNormalizedRatesByFactories.projector(
        Object.keys(products).map((k) => Number(k)),
        products,
        mocks.RecipeFactors,
        null,
        mocks.Data
      );
      expect(result[0].n).toBeGreaterThan(0);
      expect(result[1].n).toBeGreaterThan(0);
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

  describe('getNormalizedStepsWithBelts', () => {
    it('should handle empty/null values', () => {
      const result = selectors.getNormalizedStepsWithBelts.projector([], {});
      expect(Object.keys(result).length).toEqual(0);
    });

    it('should calculate rates using utility method', () => {
      spyOn(RateUtility, 'calculateBelts');
      selectors.getNormalizedStepsWithBelts.projector([], {});
      expect(RateUtility.calculateBelts).toHaveBeenCalled();
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

  describe('getZipState', () => {
    it('should put together the required state parts', () => {
      const products = [mocks.Product1];
      const recipe = mocks.RecipeSettingsEntities;
      const settings = initialSettingsState;
      const data = mocks.Data;
      const result = selectors.getZipState.projector(
        products,
        recipe,
        settings,
        data
      );
      expect(result.products).toBe(products);
      expect(result.recipe).toBe(recipe);
      expect(result.settings).toBe(settings);
      expect(result.data).toBe(data);
    });
  });
});

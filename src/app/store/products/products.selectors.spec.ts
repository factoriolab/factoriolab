import { Mocks, ItemId } from 'src/tests';
import { DisplayRate, RateType, Rational, RationalProduct } from '~/models';
import { RateUtility } from '~/utilities';
import { initialSettingsState } from '../settings';
import * as Selectors from './products.selectors';

describe('Products Selectors', () => {
  describe('getProducts', () => {
    it('should handle empty/null values', () => {
      const result = Selectors.getProducts.projector([], {});
      expect(result.length).toEqual(0);
    });

    it('should return the array of products', () => {
      const result = Selectors.getProducts.projector(
        Mocks.ProductIds,
        Mocks.ProductEntities
      );
      expect(result.length).toEqual(Mocks.ProductIds.length);
    });
  });

  describe('getRationalProducts', () => {
    it('should map products to rational products', () => {
      const result = Selectors.getRationalProducts.projector(Mocks.Products);
      expect(result[0].rate.nonzero()).toBeTrue();
    });
  });

  describe('getProductsBy', () => {
    it('should handle empty/null values', () => {
      const result = Selectors.getProductsBy.projector([]);
      expect(Object.keys(result).length).toEqual(0);
    });

    it('should return the array of product ids', () => {
      const products = [...Mocks.RationalProducts, Mocks.RationalProducts[0]];
      const result = Selectors.getProductsBy.projector(products);
      expect(Object.keys(result).length).toEqual(Mocks.ProductIds.length);
    });
  });

  describe('getNormalizedRatesByItems', () => {
    it('should handle empty/null values', () => {
      const result = Selectors.getNormalizedRatesByItems.projector({}, null);
      expect(result).toBeUndefined();
    });

    it('should return the rate entities', () => {
      const result = Selectors.getNormalizedRatesByItems.projector(
        Mocks.ProductEntities,
        DisplayRate.PerHour
      );
      expect(result[Mocks.Product1.id].nonzero()).toBeTrue();
    });
  });

  describe('getNormalizedRatesByBelts', () => {
    it('should handle empty/null values', () => {
      const result = Selectors.getNormalizedRatesByBelts.projector({}, {}, {});
      expect(result).toBeUndefined();
    });

    it('should return the rate entities', () => {
      const result = Selectors.getNormalizedRatesByBelts.projector(
        Mocks.ProductEntities,
        { [Mocks.Product2.itemId]: Mocks.ItemSettings1 },
        { [Mocks.ItemSettings1.belt]: Rational.one }
      );
      expect(result[Mocks.Product2.id].nonzero()).toBeTrue();
    });
  });

  describe('getNormalizedRatesByWagons', () => {
    it('should handle empty/null values', () => {
      const result = Selectors.getNormalizedRatesByWagons.projector(
        {},
        null,
        {}
      );
      expect(result).toBeUndefined();
    });

    it('should return the rate entities', () => {
      const result = Selectors.getNormalizedRatesByWagons.projector(
        Mocks.ProductEntities,
        DisplayRate.PerHour,
        Mocks.Data
      );
      expect(result[Mocks.Product3.id].nonzero()).toBeTrue();
    });

    it('should return the rate entities for items', () => {
      const result = Selectors.getNormalizedRatesByWagons.projector(
        {
          [RateType.Wagons]: [Mocks.RationalProducts[0]],
        },
        DisplayRate.PerHour,
        Mocks.Data
      );
      expect(result[Mocks.Product1.id].nonzero()).toBeTrue();
    });
  });

  describe('getNormalizedRatesByFactories', () => {
    it('should handle empty/null values', () => {
      const result = Selectors.getNormalizedRatesByFactories.projector({}, {});
      expect(result).toBeUndefined();
    });

    it('should handle no recipe found', () => {
      const result = Selectors.getNormalizedRatesByFactories.projector(
        {
          ...Mocks.ProductEntities,
          ...{ [Mocks.Product4.id]: [{ itemId: 'test' }] },
        },
        Mocks.Data
      );
      expect(Object.keys(result).length).toEqual(0);
    });

    it('should return the rate entities', () => {
      const result = Selectors.getNormalizedRatesByFactories.projector(
        Mocks.ProductEntities,
        Mocks.Data
      );
      expect(result[Mocks.Product4.id].nonzero()).toBeTrue();
    });

    it('should handle research products', () => {
      const product: RationalProduct = {
        id: '0',
        itemId: ItemId.MiningProductivity,
        rate: Rational.one,
        rateType: RateType.Factories,
      };
      const result = Selectors.getNormalizedRatesByFactories.projector(
        { [RateType.Factories]: [product] },
        Mocks.AdjustedData
      );
      expect(result[0].nonzero()).toBeTrue();
    });
  });

  describe('getNormalizedRates', () => {
    it('should handle empty/null values', () => {
      const result = Selectors.getNormalizedRates.projector({}, {}, {}, {});
      expect(Object.keys(result).length).toEqual(0);
    });
  });

  describe('getNormalizedSteps', () => {
    it('should handle empty/null values', () => {
      const result = Selectors.getNormalizedSteps.projector(
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
      Selectors.getNormalizedSteps.projector(
        [Mocks.Product1],
        { [Mocks.Product1.id]: Rational.one },
        {},
        {},
        null,
        null,
        {}
      );
      expect(RateUtility.addStepsFor).toHaveBeenCalled();
    });
  });

  describe('getNormalizedNodes', () => {
    it('should handle empty/null values', () => {
      const result = Selectors.getNormalizedNodes.projector(
        [],
        {},
        {},
        {},
        null,
        null,
        {}
      );
      expect(result).toEqual({ id: 'root', children: [] } as any);
    });

    it('should calculate rates using utility method', () => {
      spyOn(RateUtility, 'addNodesFor');
      Selectors.getNormalizedNodes.projector(
        [Mocks.Product1],
        { [Mocks.Product1.id]: Rational.one },
        {},
        {},
        null,
        null,
        {}
      );
      expect(RateUtility.addNodesFor).toHaveBeenCalled();
    });
  });

  describe('getNormalizedStepsWithBelts', () => {
    it('should handle empty/null values', () => {
      const result = Selectors.getNormalizedStepsWithBelts.projector([], {});
      expect(Object.keys(result).length).toEqual(0);
    });

    it('should calculate rates using utility method', () => {
      spyOn(RateUtility, 'calculateBelts');
      Selectors.getNormalizedStepsWithBelts.projector([], {});
      expect(RateUtility.calculateBelts).toHaveBeenCalled();
    });
  });

  describe('getNormalizedNodesWithBelts', () => {
    it('should calculate rates using utility method', () => {
      spyOn(RateUtility, 'calculateNodeBelts');
      Selectors.getNormalizedNodesWithBelts.projector({}, {});
      expect(RateUtility.calculateNodeBelts).toHaveBeenCalled();
    });
  });

  describe('getSteps', () => {
    it('should handle empty/null values', () => {
      const result = Selectors.getSteps.projector([], null);
      expect(Object.keys(result).length).toEqual(0);
    });

    it('should calculate rates using utility method', () => {
      spyOn(RateUtility, 'displayRate');
      Selectors.getSteps.projector([], null);
      expect(RateUtility.displayRate).toHaveBeenCalled();
    });
  });

  describe('getNodes', () => {
    it('should calculate rates using utility method', () => {
      spyOn(RateUtility, 'nodeDisplayRate');
      Selectors.getNodes.projector({}, null);
      expect(RateUtility.nodeDisplayRate).toHaveBeenCalled();
    });
  });

  describe('getZipState', () => {
    it('should put together the required state parts', () => {
      const products = [Mocks.Product1];
      const items = Mocks.ItemSettingsEntities;
      const recipes = Mocks.RecipeSettingsEntities;
      const settings = initialSettingsState;
      const data = Mocks.Data;
      const defaults = Mocks.Defaults;
      const result = Selectors.getZipState.projector(
        products,
        items,
        recipes,
        settings,
        defaults
      );
      expect(result.products).toBe(products);
      expect(result.items).toBe(items);
      expect(result.recipes).toBe(recipes);
      expect(result.settings).toBe(settings);
      expect(result.defaults).toBe(defaults);
    });
  });
});

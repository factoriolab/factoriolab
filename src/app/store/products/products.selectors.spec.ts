import { Mocks, ItemId, RecipeId } from 'src/tests';
import { DisplayRate, RateType, Rational, RationalProduct } from '~/models';
import {
  RateUtility,
  FlowUtility,
  SimplexUtility,
  RecipeUtility,
} from '~/utilities';
import { initialSettingsState } from '../settings';
import * as Selectors from './products.selectors';

describe('Products Selectors', () => {
  describe('getProducts', () => {
    it('should handle empty/null values', () => {
      const result = Selectors.getProducts.projector([], {}, {});
      expect(result.length).toEqual(0);
    });

    it('should return the array of products', () => {
      const result = Selectors.getProducts.projector(
        Mocks.ProductsState1.ids,
        Mocks.ProductsState1.entities,
        Mocks.Data
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

  describe('getProductRecipes', () => {
    it('should handle empty/null values', () => {
      const result = Selectors.getProductSteps.projector(
        null,
        null,
        null,
        null
      );
      expect(result).toBeUndefined();
    });

    it('should use the utility method to determine recipes', () => {
      spyOn(SimplexUtility, 'getSteps');
      const result = Selectors.getProductSteps.projector(
        [Mocks.Product4],
        null,
        null,
        null
      );
      expect(SimplexUtility.getSteps).toHaveBeenCalled();
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

  describe('getProductsByItems', () => {
    it('should select the products calculated by items', () => {
      expect(
        Selectors.getProductsByItems.projector({
          [RateType.Items]: true,
        } as any)
      ).toBeTrue();
    });
  });

  describe('getProductsByBelts', () => {
    it('should select the products calculated by belts', () => {
      expect(
        Selectors.getProductsByBelts.projector({
          [RateType.Belts]: true,
        } as any)
      ).toBeTrue();
    });
  });

  describe('getProductsByWagons', () => {
    it('should select the products calculated by wagons', () => {
      expect(
        Selectors.getProductsByWagons.projector({
          [RateType.Wagons]: true,
        } as any)
      ).toBeTrue();
    });
  });

  describe('getProductsByFactories', () => {
    it('should select the products calculated by factories', () => {
      expect(
        Selectors.getProductsByFactories.projector({
          [RateType.Factories]: true,
        } as any)
      ).toBeTrue();
    });
  });

  describe('getNormalizedRatesByItems', () => {
    it('should handle empty/null values', () => {
      const result = Selectors.getNormalizedRatesByItems.projector(
        null,
        null,
        null
      );
      expect(result).toBeUndefined();
    });

    it('should return the rate entities', () => {
      const result = Selectors.getNormalizedRatesByItems.projector(
        [Mocks.RationalProducts[0]],
        null,
        DisplayRate.PerHour
      );
      expect(result[Mocks.Product1.id].nonzero()).toBeTrue();
    });

    it('should calculate using via step', () => {
      spyOn(RecipeUtility, 'getProductStepData').and.returnValue([
        '0',
        Rational.two,
      ]);
      const result = Selectors.getNormalizedRatesByItems.projector(
        [
          {
            id: '0',
            itemId: ItemId.Coal,
            rate: Rational.one,
            rateType: RateType.Items,
            viaId: RecipeId.IronOre,
          },
        ],
        {
          [ItemId.Coal]: [[ItemId.IronOre, Rational.two]],
        },
        DisplayRate.PerMinute
      );
      expect(RecipeUtility.getProductStepData).toHaveBeenCalled();
      expect(result['0']).toEqual(Rational.from(1, 120));
    });

    it('should fall back to zero if via is not found', () => {
      spyOn(RecipeUtility, 'getProductStepData').and.returnValue(null);
      const result = Selectors.getNormalizedRatesByItems.projector(
        [
          {
            id: '0',
            itemId: ItemId.Coal,
            rate: Rational.one,
            rateType: RateType.Items,
            viaId: RecipeId.IronOre,
          },
        ],
        { [ItemId.Coal]: [[RecipeId.IronOre, Rational.two]] },
        DisplayRate.PerMinute
      );
      expect(RecipeUtility.getProductStepData).toHaveBeenCalled();
      expect(result['0']).toEqual(Rational.zero);
    });
  });

  describe('getNormalizedRatesByBelts', () => {
    it('should handle empty/null values', () => {
      const result = Selectors.getNormalizedRatesByBelts.projector(
        null,
        null,
        {},
        {}
      );
      expect(result).toBeUndefined();
    });

    it('should return the rate entities', () => {
      const result = Selectors.getNormalizedRatesByBelts.projector(
        [Mocks.RationalProducts[1]],
        null,
        { [Mocks.Product2.itemId]: Mocks.ItemSettings1 },
        { [Mocks.ItemSettings1.belt]: Rational.one }
      );
      expect(result[Mocks.Product2.id].nonzero()).toBeTrue();
    });

    it('should calculate using via step', () => {
      spyOn(RecipeUtility, 'getProductStepData').and.returnValue([
        '0',
        Rational.two,
      ]);
      const result = Selectors.getNormalizedRatesByBelts.projector(
        [
          {
            id: '0',
            itemId: ItemId.Coal,
            rate: Rational.one,
            rateType: RateType.Belts,
            viaId: RecipeId.IronOre,
          },
        ],
        {
          [ItemId.Coal]: [[ItemId.IronOre, Rational.two]],
        },
        Mocks.ItemSettingsInitial,
        Mocks.BeltSpeed
      );
      expect(RecipeUtility.getProductStepData).toHaveBeenCalled();
      expect(result['0']).toEqual(Rational.from(15, 2));
    });

    it('should fall back to zero if via is not found', () => {
      spyOn(RecipeUtility, 'getProductStepData').and.returnValue(null);
      const result = Selectors.getNormalizedRatesByBelts.projector(
        [
          {
            id: '0',
            itemId: ItemId.Coal,
            rate: Rational.one,
            rateType: RateType.Belts,
            viaId: RecipeId.IronOre,
          },
        ],
        { [ItemId.Coal]: [[RecipeId.IronOre, Rational.two]] },
        Mocks.ItemSettingsInitial,
        Mocks.BeltSpeed
      );
      expect(RecipeUtility.getProductStepData).toHaveBeenCalled();
      expect(result['0']).toEqual(Rational.zero);
    });
  });

  describe('getNormalizedRatesByWagons', () => {
    it('should handle empty/null values', () => {
      const result = Selectors.getNormalizedRatesByWagons.projector(
        null,
        null,
        null,
        {}
      );
      expect(result).toBeUndefined();
    });

    it('should return the rate entities', () => {
      const result = Selectors.getNormalizedRatesByWagons.projector(
        [Mocks.RationalProducts[2]],
        null,
        DisplayRate.PerHour,
        Mocks.Data
      );
      expect(result[Mocks.Product3.id].nonzero()).toBeTrue();
    });

    it('should return the rate entities for items', () => {
      const result = Selectors.getNormalizedRatesByWagons.projector(
        [Mocks.RationalProducts[0]],
        null,
        DisplayRate.PerHour,
        Mocks.Data
      );
      expect(result[Mocks.Product1.id].nonzero()).toBeTrue();
    });

    it('should calculate using via step', () => {
      spyOn(RecipeUtility, 'getProductStepData').and.returnValue([
        '0',
        Rational.two,
      ]);
      const result = Selectors.getNormalizedRatesByWagons.projector(
        [
          {
            id: '0',
            itemId: ItemId.Coal,
            rate: Rational.one,
            rateType: RateType.Wagons,
            viaId: RecipeId.IronOre,
          },
          {
            id: '1',
            itemId: ItemId.Coal,
            rate: Rational.one,
            rateType: RateType.Wagons,
            viaId: ItemId.PetroleumGas,
          },
        ],
        {
          [ItemId.Coal]: [
            [ItemId.IronOre, Rational.two],
            [ItemId.PetroleumGas, Rational.one],
          ],
        },
        DisplayRate.PerMinute,
        Mocks.AdjustedData
      );
      expect(RecipeUtility.getProductStepData).toHaveBeenCalled();
      expect(result['0']).toEqual(Rational.from(50, 3));
      expect(result['1']).toEqual(Rational.from(625, 3));
    });

    it('should fall back to zero if via is not found', () => {
      spyOn(RecipeUtility, 'getProductStepData').and.returnValue(null);
      const result = Selectors.getNormalizedRatesByWagons.projector(
        [
          {
            id: '0',
            itemId: ItemId.Coal,
            rate: Rational.one,
            rateType: RateType.Wagons,
            viaId: RecipeId.IronOre,
          },
        ],
        { [ItemId.Coal]: [[RecipeId.IronOre, Rational.two]] },
        DisplayRate.PerMinute,
        Mocks.AdjustedData
      );
      expect(RecipeUtility.getProductStepData).toHaveBeenCalled();
      expect(result['0']).toEqual(Rational.zero);
    });
  });

  describe('getNormalizedRatesByFactories', () => {
    it('should handle empty/null values', () => {
      const result = Selectors.getNormalizedRatesByFactories.projector(
        null,
        {},
        {}
      );
      expect(result).toBeUndefined();
    });

    it('should return the rate entities', () => {
      const result = Selectors.getNormalizedRatesByFactories.projector(
        [Mocks.RationalProducts[3]],
        {},
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
        [product],
        {},
        Mocks.AdjustedData
      );
      expect(result[0].nonzero()).toBeTrue();
    });

    it('should directly calculate if viaId matches simple recipe', () => {
      spyOn(RecipeUtility, 'getProductStepData');
      const result = Selectors.getNormalizedRatesByFactories.projector(
        [
          {
            id: '0',
            itemId: ItemId.Coal,
            rate: Rational.one,
            rateType: RateType.Factories,
            viaId: RecipeId.Coal,
          },
        ],
        null,
        Mocks.AdjustedData
      );
      expect(RecipeUtility.getProductStepData).not.toHaveBeenCalled();
      expect(result['0']).toEqual(Rational.from(3, 4));
    });

    it('should calculate using via step', () => {
      spyOn(RecipeUtility, 'getProductStepData').and.returnValue([
        '0',
        Rational.two,
      ]);
      const result = Selectors.getNormalizedRatesByFactories.projector(
        [
          {
            id: '0',
            itemId: ItemId.Coal,
            rate: Rational.one,
            rateType: RateType.Factories,
            viaId: RecipeId.IronOre,
          },
        ],
        { [ItemId.Coal]: [[RecipeId.IronOre, Rational.two]] },
        Mocks.AdjustedData
      );
      expect(RecipeUtility.getProductStepData).toHaveBeenCalled();
      expect(result['0']).toEqual(Rational.from(1, 2));
    });

    it('should fall back to zero if via is not found', () => {
      spyOn(RecipeUtility, 'getProductStepData').and.returnValue(null);
      const result = Selectors.getNormalizedRatesByFactories.projector(
        [
          {
            id: '0',
            itemId: ItemId.Coal,
            rate: Rational.one,
            rateType: RateType.Factories,
            viaId: RecipeId.IronOre,
          },
        ],
        { [ItemId.Coal]: [[RecipeId.IronOre, Rational.two]] },
        Mocks.AdjustedData
      );
      expect(RecipeUtility.getProductStepData).toHaveBeenCalled();
      expect(result['0']).toEqual(Rational.zero);
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

  describe('getNormalizedStepsWithMatrices', () => {
    it('should handle empty/null values', () => {
      const result = Selectors.getNormalizedStepsWithMatrices.projector(
        [],
        {},
        {},
        []
      );
      expect(Object.keys(result).length).toEqual(0);
    });

    it('should calculate rates using utility method', () => {
      spyOn(SimplexUtility, 'solve').and.returnValue([]);
      Selectors.getNormalizedStepsWithMatrices.projector(
        [Mocks.Step1],
        {},
        {},
        []
      );
      expect(SimplexUtility.solve).toHaveBeenCalled();
    });
  });

  describe('getNormalizedStepsWithBelts', () => {
    it('should handle empty/null values', () => {
      const result = Selectors.getNormalizedStepsWithBelts.projector(
        [],
        {},
        {},
        {}
      );
      expect(Object.keys(result).length).toEqual(0);
    });

    it('should calculate rates using utility method', () => {
      spyOn(RateUtility, 'calculateBelts');
      Selectors.getNormalizedStepsWithBelts.projector([], {}, {}, {});
      expect(RateUtility.calculateBelts).toHaveBeenCalled();
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

  describe('getSankey', () => {
    it('should handle empty/null values', () => {
      const result = Selectors.getSankey.projector([], null, null);
      expect(result).toEqual({ nodes: [], links: [] });
    });

    it('should build sankey model using utility method', () => {
      spyOn(FlowUtility, 'buildSankey');
      Selectors.getSankey.projector([], null, null);
      expect(FlowUtility.buildSankey).toHaveBeenCalled();
    });
  });

  describe('getZipState', () => {
    it('should put together the required state parts', () => {
      const products = Mocks.ProductsState1;
      const items = Mocks.ItemSettingsEntities;
      const recipes = Mocks.RecipeSettingsEntities;
      const factories = Mocks.FactorySettingsInitial;
      const settings = initialSettingsState;
      const result = Selectors.getZipState.projector(
        products,
        items,
        recipes,
        factories,
        settings
      );
      expect(result.products).toBe(products);
      expect(result.items).toBe(items);
      expect(result.recipes).toBe(recipes);
      expect(result.factories).toBe(factories);
      expect(result.settings).toBe(settings);
    });
  });
});

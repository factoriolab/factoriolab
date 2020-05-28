import Fraction from 'fraction.js';

import * as Mocks from 'src/mocks';
import {
  DisplayRate,
  ItemId,
  RateType,
  Product,
  RecipeId,
  NEntities,
} from '~/models';
import {
  RateUtility,
  UraniumUtility,
  OilUtility,
  RecipeUtility,
} from '~/utilities';
import { initialSettingsState } from '../settings';
import * as Selectors from './products.selectors';

describe('Products Selectors', () => {
  describe('getProducts', () => {
    it('should handle empty/null values', () => {
      const result = Selectors.getProducts.projector([], {});
      expect(result.length).toEqual(0);
    });

    it('should return the array of product ids', () => {
      const result = Selectors.getProducts.projector(
        Mocks.ProductIds,
        Mocks.ProductEntities
      );
      expect(result.length).toEqual(Mocks.ProductIds.length);
    });
  });

  describe('getProductsByItems', () => {
    it('should handle empty/null values', () => {
      const result = Selectors.getProductsByItems.projector([], {});
      expect(result.length).toEqual(0);
    });

    it('should return the array of product ids', () => {
      const result = Selectors.getProductsByItems.projector(
        Mocks.ProductIds,
        Mocks.ProductEntities
      );
      expect(result.length).toEqual(1);
    });
  });

  describe('getProductsByBelts', () => {
    it('should handle empty/null values', () => {
      const result = Selectors.getProductsByBelts.projector([], {});
      expect(result.length).toEqual(0);
    });

    it('should return the array of product ids', () => {
      const result = Selectors.getProductsByBelts.projector(
        Mocks.ProductIds,
        Mocks.ProductEntities
      );
      expect(result.length).toEqual(1);
    });
  });

  describe('getProductsByWagons', () => {
    it('should handle empty/null values', () => {
      const result = Selectors.getProductsByWagons.projector([], {});
      expect(result.length).toEqual(0);
    });

    it('should return the array of product ids', () => {
      const result = Selectors.getProductsByWagons.projector(
        Mocks.ProductIds,
        Mocks.ProductEntities
      );
      expect(result.length).toEqual(1);
    });
  });

  describe('getProductsByFactories', () => {
    it('should handle empty/null values', () => {
      const result = Selectors.getProductsByFactories.projector([], {});
      expect(result.length).toEqual(0);
    });

    it('should return the array of product ids', () => {
      const result = Selectors.getProductsByFactories.projector(
        Mocks.ProductIds,
        Mocks.ProductEntities
      );
      expect(result.length).toEqual(1);
    });
  });

  describe('getNormalizedRatesByItems', () => {
    it('should handle empty/null values', () => {
      const result = Selectors.getNormalizedRatesByItems.projector(
        [],
        {},
        null
      );
      expect(Object.keys(result).length).toEqual(0);
    });

    it('should return the rate entities', () => {
      const result = Selectors.getNormalizedRatesByItems.projector(
        [Mocks.Product1.id],
        Mocks.ProductEntities,
        DisplayRate.PerHour
      );
      expect(result[Mocks.Product1.id].n).toBeGreaterThan(0);
    });
  });

  describe('getNormalizedRatesByBelts', () => {
    it('should handle empty/null values', () => {
      const result = Selectors.getNormalizedRatesByBelts.projector(
        [],
        {},
        {},
        null,
        {}
      );
      expect(Object.keys(result).length).toEqual(0);
    });

    it('should return the rate entities', () => {
      const result = Selectors.getNormalizedRatesByBelts.projector(
        [Mocks.Product2.id],
        Mocks.ProductEntities,
        { [Mocks.Product2.itemId]: Mocks.Settings1 },
        RecipeId.BasicOilProcessing,
        { [Mocks.Settings1.belt]: new Fraction(1) }
      );
      expect(result[Mocks.Product2.id].n).toBeGreaterThan(0);
    });

    it('should calculate rate for oil products', () => {
      const products: { [key: number]: Product } = {
        [0]: {
          id: 0,
          itemId: ItemId.HeavyOil,
          rate: 1,
          rateType: RateType.Belts,
        },
        [1]: {
          id: 1,
          itemId: ItemId.LightOil,
          rate: 1,
          rateType: RateType.Belts,
        },
        [2]: {
          id: 2,
          itemId: ItemId.PetroleumGas,
          rate: 1,
          rateType: RateType.Belts,
        },
      };
      const result = Selectors.getNormalizedRatesByBelts.projector(
        Object.keys(products),
        products,
        {},
        null,
        { [ItemId.Pipe]: new Fraction(1) }
      );
      expect(result[0].n).toBeGreaterThan(0);
      expect(result[1].n).toBeGreaterThan(0);
      expect(result[2].n).toBeGreaterThan(0);
    });

    it('should calculate rate for solid fuel by basic processing', () => {
      const belt = ItemId.TransportBelt;
      const products: { [key: number]: Product } = {
        [0]: {
          id: 0,
          itemId: ItemId.SolidFuel,
          rate: 1,
          rateType: RateType.Belts,
        },
      };
      const result = Selectors.getNormalizedRatesByBelts.projector(
        [0],
        products,
        {
          [RecipeId.SolidFuelFromPetroleumGas]: { belt },
        },
        RecipeId.BasicOilProcessing,
        { [belt]: new Fraction(1) }
      );
      expect(result[0].n).toBeGreaterThan(0);
    });

    it('should calculate rate for solid fuel by advanced processing', () => {
      const belt = ItemId.TransportBelt;
      const products: { [key: number]: Product } = {
        [0]: {
          id: 0,
          itemId: ItemId.SolidFuel,
          rate: 1,
          rateType: RateType.Belts,
        },
      };
      const result = Selectors.getNormalizedRatesByBelts.projector(
        [0],
        products,
        {
          [RecipeId.SolidFuelFromLightOil]: { belt },
        },
        RecipeId.AdvancedOilProcessing,
        { [belt]: new Fraction(1) }
      );
      expect(result[0].n).toBeGreaterThan(0);
    });

    it('should calculate rate for uranium products', () => {
      const belt = ItemId.TransportBelt;
      const products: { [key: number]: Product } = {
        [0]: {
          id: 0,
          itemId: ItemId.Uranium238,
          rate: 1,
          rateType: RateType.Belts,
        },
        [1]: {
          id: 1,
          itemId: ItemId.Uranium235,
          rate: 1,
          rateType: RateType.Belts,
        },
      };
      const result = Selectors.getNormalizedRatesByBelts.projector(
        Object.keys(products),
        products,
        {
          [RecipeId.UraniumProcessing]: { belt },
          [RecipeId.KovarexEnrichmentProcess]: { belt },
        },
        null,
        { [belt]: new Fraction(1) }
      );
      expect(result[0].n).toBeGreaterThan(0);
      expect(result[1].n).toBeGreaterThan(0);
    });
  });

  describe('getNormalizedRatesByWagons', () => {
    it('should handle empty/null values', () => {
      const result = Selectors.getNormalizedRatesByWagons.projector(
        [],
        {},
        null,
        {}
      );
      expect(Object.keys(result).length).toEqual(0);
    });

    it('should return the rate entities', () => {
      const result = Selectors.getNormalizedRatesByWagons.projector(
        [Mocks.Product2.id],
        Mocks.ProductEntities,
        DisplayRate.PerHour,
        Mocks.Data
      );
      expect(result[Mocks.Product2.id].n).toBeGreaterThan(0);
    });

    it('should return the rate entities for fluids', () => {
      const result = Selectors.getNormalizedRatesByWagons.projector(
        [Mocks.Product3.id],
        Mocks.ProductEntities,
        DisplayRate.PerHour,
        Mocks.Data
      );
      expect(result[Mocks.Product3.id].n).toBeGreaterThan(0);
    });
  });

  describe('getNormalizedRatesByFactories', () => {
    it('should handle empty/null values', () => {
      const result = Selectors.getNormalizedRatesByFactories.projector(
        [],
        {},
        {},
        null,
        {}
      );
      expect(Object.keys(result).length).toEqual(0);
    });

    it('should handle no recipe found', () => {
      const result = Selectors.getNormalizedRatesByFactories.projector(
        [Mocks.Product1.id],
        {
          ...Mocks.ProductEntities,
          ...{ [Mocks.Product1.id]: { itemId: 'test' } },
        },
        Mocks.RecipeFactors,
        null,
        Mocks.Data
      );
      expect(Object.keys(result).length).toEqual(0);
    });

    it('should return the rate entities', () => {
      const result = Selectors.getNormalizedRatesByFactories.projector(
        [Mocks.Product1.id],
        Mocks.ProductEntities,
        {
          [Mocks.Product1.itemId]: {
            prod: new Fraction(1),
            speed: new Fraction(1),
          },
        },
        null,
        Mocks.Data
      );
      expect(result[Mocks.Product1.id].n).toBeGreaterThan(0);
    });

    it('should return the rate entities for recipe with specific outputs', () => {
      const result = Selectors.getNormalizedRatesByFactories.projector(
        [Mocks.Product4.id],
        Mocks.ProductEntities,
        {
          [Mocks.Product4.itemId]: {
            prod: new Fraction(1),
            speed: new Fraction(1),
          },
        },
        null,
        Mocks.Data
      );
      expect(result[Mocks.Product4.id].n).toBeGreaterThan(0);
    });

    it('should handle research products', () => {
      const product: Product = {
        id: 0,
        itemId: ItemId.MiningProductivity,
        rate: 1,
        rateType: RateType.Factories,
      };
      const result = Selectors.getNormalizedRatesByFactories.projector(
        [0],
        { [0]: product },
        Mocks.RecipeFactors,
        null,
        Mocks.Data
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
      const result = Selectors.getNormalizedRatesByFactories.projector(
        Object.keys(products).map((k) => Number(k)),
        products,
        Mocks.RecipeFactors,
        RecipeId.AdvancedOilProcessing,
        Mocks.Data
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
      const result = Selectors.getNormalizedRatesByFactories.projector(
        Object.keys(products).map((k) => Number(k)),
        products,
        Mocks.RecipeFactors,
        null,
        Mocks.Data
      );
      expect(result[0].n).toBeGreaterThan(0);
      expect(result[1].n).toBeGreaterThan(0);
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
        { [Mocks.Product1.id]: new Fraction(1) },
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
        { [Mocks.Product1.id]: new Fraction(1) },
        {},
        {},
        null,
        null,
        {}
      );
      expect(RateUtility.addNodesFor).toHaveBeenCalled();
    });
  });

  describe('getNormalizedStepsWithUranium', () => {
    it('should handle empty/null values', () => {
      const result = Selectors.getNormalizedStepsWithUranium.projector(
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
      Selectors.getNormalizedStepsWithUranium.projector(
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
      const result = Selectors.getNormalizedStepsWithOil.projector(
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
      Selectors.getNormalizedStepsWithOil.projector([], {}, {}, null, null, {});
      expect(OilUtility.addSteps).toHaveBeenCalled();
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

  describe('getDisplayRateSteps', () => {
    it('should handle empty/null values', () => {
      const result = Selectors.getDisplayRateSteps.projector([], null);
      expect(Object.keys(result).length).toEqual(0);
    });

    it('should calculate rates using utility method', () => {
      spyOn(RateUtility, 'displayRate');
      Selectors.getDisplayRateSteps.projector([], null);
      expect(RateUtility.displayRate).toHaveBeenCalled();
    });
  });

  describe('getRawNodes', () => {
    it('should calculate rates using utility method', () => {
      spyOn(RateUtility, 'nodeDisplayRate');
      Selectors.getRawNodes.projector({}, null);
      expect(RateUtility.nodeDisplayRate).toHaveBeenCalled();
    });
  });

  describe('getNodes', () => {
    it('should sort using utility method', () => {
      spyOn(RecipeUtility, 'sortNode');
      Selectors.getNodes.projector({}, null);
      expect(RecipeUtility.sortNode).toHaveBeenCalled();
    });
  });

  describe('getSteps', () => {
    it('should handle empty/null values', () => {
      const result = Selectors.getSteps.projector([]);
      expect(Object.keys(result).length).toEqual(0);
    });

    it('should sort using utility method', () => {
      spyOn(RecipeUtility, 'sort');
      Selectors.getSteps.projector([]);
      expect(RecipeUtility.sort).toHaveBeenCalled();
    });
  });

  describe('getZipState', () => {
    it('should put together the required state parts', () => {
      const products = [Mocks.Product1];
      const recipe = Mocks.RecipeSettingsEntities;
      const settings = initialSettingsState;
      const data = Mocks.Data;
      const result = Selectors.getZipState.projector(
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

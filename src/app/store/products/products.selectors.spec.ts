import { ItemId, Mocks, RecipeId } from 'src/tests';
import {
  Column,
  DisplayRate,
  Game,
  MatrixResultType,
  PowerUnit,
  RateType,
  Rational,
  RationalProduct,
  Step,
  StepDetailTab,
} from '~/models';
import {
  FlowUtility,
  RateUtility,
  RecipeUtility,
  SimplexUtility,
} from '~/utilities';
import * as Items from '../items';
import * as Recipes from '../recipes';
import * as Settings from '../settings';
import * as Selectors from './products.selectors';

describe('Products Selectors', () => {
  describe('Base selector functions', () => {
    it('should get slices of state', () => {
      expect(
        Selectors.productsState({ productsState: Mocks.ProductsState } as any)
      ).toEqual(Mocks.ProductsState);
      expect(Selectors.getIds.projector(Mocks.ProductsState)).toEqual(
        Mocks.ProductsState.ids
      );
      expect(Selectors.getEntities.projector(Mocks.ProductsState)).toEqual(
        Mocks.ProductsState.entities
      );
    });
  });

  describe('getBaseProducts', () => {
    it('should handle empty/null values', () => {
      const result = Selectors.getBaseProducts.projector([], {}, {});
      expect(result.length).toEqual(0);
    });

    it('should return the array of products', () => {
      const result = Selectors.getBaseProducts.projector(
        Mocks.ProductsState.ids,
        Mocks.ProductsState.entities,
        Mocks.Dataset
      );
      expect(result.length).toEqual(Mocks.ProductIds.length);
    });
  });

  describe('getProductSteps', () => {
    it('should handle empty/null values', () => {
      const result = Selectors.getProductSteps.projector(
        null,
        null,
        null,
        null,
        {}
      );
      expect(result).toBeUndefined();
    });

    it('should use the utility method to determine steps', () => {
      spyOn(SimplexUtility, 'getSteps');
      const result = Selectors.getProductSteps.projector(
        [Mocks.Product4],
        null,
        null,
        {},
        null
      );
      expect(SimplexUtility.getSteps).toHaveBeenCalled();
    });
  });

  describe('getProducts', () => {
    it('should handle empty/null values', () => {
      const result = Selectors.getProducts.projector(
        null,
        null,
        null,
        null,
        null
      );
      expect(result).toBeUndefined();
    });

    it('should use the utility method to adjust products', () => {
      spyOn(RecipeUtility, 'adjustProduct');
      const result = Selectors.getProducts.projector(
        ['a', 'b'],
        null,
        null,
        null,
        null
      );
      expect(RecipeUtility.adjustProduct).toHaveBeenCalledTimes(2);
    });
  });

  describe('getProductOptions', () => {
    it('should map product steps to a list of options', () => {
      const result = Selectors.getProductOptions.projector(
        Mocks.ProductsList,
        Mocks.ProductSteps
      );
      expect(Object.keys(result).length).toEqual(Mocks.ProductsList.length);
    });
  });

  describe('getRationalProducts', () => {
    it('should map products to rational products', () => {
      const result = Selectors.getRationalProducts.projector(
        Mocks.ProductsList
      );
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
        { [Mocks.ItemSettings1.beltId!]: Rational.one }
      );
      expect(result[Mocks.Product2.id].nonzero()).toBeTrue();
    });

    it('should return the rate entities by via setting', () => {
      const result = Selectors.getNormalizedRatesByBelts.projector(
        [
          {
            ...Mocks.RationalProducts[1],
            ...{ viaSetting: ItemId.TransportBelt },
          },
        ],
        null,
        { [Mocks.Product2.itemId]: Mocks.ItemSettings1 },
        { [Mocks.ItemSettings1.beltId!]: Rational.one }
      );
      expect(result[Mocks.Product2.id].nonzero()).toBeTrue();
    });

    it('should calculate using via step', () => {
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
      expect(result['0']).toEqual(Rational.from(15, 2));
    });

    it('should calculate using via step and setting', () => {
      const result = Selectors.getNormalizedRatesByBelts.projector(
        [
          {
            id: '0',
            itemId: ItemId.Coal,
            rate: Rational.one,
            rateType: RateType.Belts,
            viaId: RecipeId.IronOre,
            viaSetting: ItemId.TransportBelt,
          },
        ],
        {
          [ItemId.Coal]: [[ItemId.IronOre, Rational.two]],
        },
        Mocks.ItemSettingsInitial,
        Mocks.BeltSpeed
      );
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
        Mocks.ItemSettingsInitial,
        DisplayRate.PerHour,
        Mocks.Dataset
      );
      expect(result[Mocks.Product3.id].nonzero()).toBeTrue();
    });

    it('should return the rate entities by via setting', () => {
      const result = Selectors.getNormalizedRatesByWagons.projector(
        [
          {
            ...Mocks.RationalProducts[2],
            ...{ viaSetting: ItemId.CargoWagon },
          },
        ],
        null,
        Mocks.ItemSettingsInitial,
        DisplayRate.PerHour,
        Mocks.Dataset
      );
      expect(result[Mocks.Product3.id].nonzero()).toBeTrue();
    });

    it('should return the rate entities for items', () => {
      const result = Selectors.getNormalizedRatesByWagons.projector(
        [Mocks.RationalProducts[0]],
        null,
        Mocks.ItemSettingsInitial,
        DisplayRate.PerHour,
        Mocks.Dataset
      );
      expect(result[Mocks.Product1.id].nonzero()).toBeTrue();
    });

    it('should calculate using via step', () => {
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
        Mocks.ItemSettingsInitial,
        DisplayRate.PerMinute,
        Mocks.AdjustedData
      );
      expect(result['0']).toEqual(Rational.from(50, 3));
      expect(result['1']).toEqual(Rational.from(1250, 3));
    });

    it('should calculate using via step and setting', () => {
      const result = Selectors.getNormalizedRatesByWagons.projector(
        [
          {
            id: '0',
            itemId: ItemId.Coal,
            rate: Rational.one,
            rateType: RateType.Wagons,
            viaId: RecipeId.IronOre,
            viaSetting: ItemId.CargoWagon,
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
        Mocks.ItemSettingsInitial,
        DisplayRate.PerMinute,
        Mocks.AdjustedData
      );
      expect(result['0']).toEqual(Rational.from(50, 3));
      expect(result['1']).toEqual(Rational.from(1250, 3));
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
        Mocks.ItemSettingsInitial,
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
        null,
        {},
        {},
        {
          fuelId: null,
          proliferatorSprayId: null,
          miningBonus: null,
          researchSpeed: null,
          data: null,
        },
        null
      );
      expect(result).toBeUndefined();
    });

    it('should return the rate entities', () => {
      const result = Selectors.getNormalizedRatesByFactories.projector(
        [Mocks.RationalProducts[3]],
        null,
        {},
        {},
        {
          fuelId: null,
          proliferatorSprayId: null,
          miningBonus: null,
          researchSpeed: null,
          data: null,
        },
        Mocks.Dataset
      );
      expect(result[Mocks.Product4.id].nonzero()).toBeTrue();
    });

    it('should handle research products', () => {
      const product: RationalProduct = {
        id: '0',
        itemId: ItemId.MiningProductivity,
        rate: Rational.one,
        rateType: RateType.Factories,
        viaId: RecipeId.MiningProductivity,
      };
      const result = Selectors.getNormalizedRatesByFactories.projector(
        [product],
        null,
        {},
        {},
        {
          fuelId: null,
          proliferatorSprayId: null,
          miningBonus: null,
          researchSpeed: null,
          data: null,
        },
        Mocks.AdjustedData
      );
      expect(result['0'].nonzero()).toBeTrue();
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
        {},
        {},
        {
          fuelId: null,
          proliferatorSprayId: null,
          miningBonus: null,
          researchSpeed: null,
          data: null,
        },
        Mocks.AdjustedData
      );
      expect(RecipeUtility.getProductStepData).not.toHaveBeenCalled();
      expect(result['0']).toEqual(Rational.from(1183, 400));
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
        {},
        {},
        {
          fuelId: null,
          proliferatorSprayId: null,
          miningBonus: null,
          researchSpeed: null,
          data: null,
        },
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
        {},
        {},
        {
          fuelId: null,
          proliferatorSprayId: null,
          miningBonus: null,
          researchSpeed: null,
          data: null,
        },
        Mocks.AdjustedData
      );
      expect(RecipeUtility.getProductStepData).toHaveBeenCalled();
      expect(result['0']).toEqual(Rational.zero);
    });

    it('should handle via recipe settings', () => {
      const result = Selectors.getNormalizedRatesByFactories.projector(
        [
          {
            id: '0',
            itemId: ItemId.Coal,
            rate: Rational.one,
            rateType: RateType.Factories,
            viaId: RecipeId.Coal,
            viaSetting: ItemId.AssemblingMachine2,
            viaFactoryModuleIds: [],
            viaBeaconCount: Rational.zero,
            viaBeaconId: ItemId.Beacon,
            viaBeaconModuleIds: [],
          },
        ],
        { [ItemId.Coal]: [[RecipeId.IronOre, Rational.two]] },
        Mocks.RationalRecipeSettingsInitial,
        {},
        {
          fuelId: ItemId.Coal,
          proliferatorSprayId: ItemId.ProductivityModule,
          miningBonus: Rational.zero,
          researchSpeed: Rational.one,
          data: Mocks.Dataset,
        },
        Mocks.AdjustedData
      );
      expect(result['0']).toEqual(Rational.from(3, 4));
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

  describe('getMatrixResult', () => {
    it('should handle empty/null values', () => {
      spyOn(SimplexUtility, 'solve');
      const result = Selectors.getMatrixResult.projector([], {}, [], {}, {});
      expect(SimplexUtility.solve).not.toHaveBeenCalled();
      expect(result).toEqual({ steps: [], result: MatrixResultType.Skipped });
    });

    it('should calculate rates using utility method', () => {
      spyOn(SimplexUtility, 'solve').and.returnValue({
        steps: [],
        result: MatrixResultType.Skipped,
      });
      Selectors.getMatrixResult.projector(
        [Mocks.Step1],
        {},
        [],
        { simplex: true },
        {}
      );
      expect(SimplexUtility.solve).toHaveBeenCalled();
    });
  });

  describe('getNormalizedStepsWithBelts', () => {
    it('should handle empty/null values', () => {
      const result = Selectors.getNormalizedStepsWithBelts.projector(
        { steps: [], result: MatrixResultType.Skipped },
        {},
        {},
        {}
      );
      expect(Object.keys(result).length).toEqual(0);
    });

    it('should calculate rates using utility method', () => {
      spyOn(RateUtility, 'calculateBelts');
      Selectors.getNormalizedStepsWithBelts.projector(
        { steps: [], result: MatrixResultType.Skipped },
        {},
        {},
        {}
      );
      expect(RateUtility.calculateBelts).toHaveBeenCalled();
    });
  });

  describe('getNormalizedStepsWithOutputs', () => {
    it('should call utility to calculate outputs', () => {
      spyOn(RateUtility, 'calculateOutputs');
      Selectors.getNormalizedStepsWithOutputs.projector(
        Mocks.Steps,
        Mocks.AdjustedData
      );
      expect(RateUtility.calculateOutputs).toHaveBeenCalled();
    });
  });

  describe('getNormalizedStepsWithBeacons', () => {
    it('should call utility to calculate beacons', () => {
      spyOn(RateUtility, 'calculateBeacons');
      Selectors.getNormalizedStepsWithBeacons.projector(
        Mocks.Steps,
        Rational.one,
        {},
        Mocks.AdjustedData
      );
      expect(RateUtility.calculateBeacons).toHaveBeenCalled();
    });
  });

  describe('getSteps', () => {
    it('should handle empty/null values', () => {
      const result = Selectors.getSteps.projector([], null);
      expect(Object.keys(result).length).toEqual(0);
    });

    it('should calculate rates using utility method', () => {
      spyOn(RateUtility, 'sortHierarchy');
      spyOn(RateUtility, 'displayRate').and.returnValue([]);
      Selectors.getSteps.projector([], null);
      expect(RateUtility.displayRate).toHaveBeenCalled();
      expect(RateUtility.sortHierarchy).toHaveBeenCalled();
    });
  });

  describe('getSankey', () => {
    it('should handle empty/null values', () => {
      const result = Selectors.getSankey.projector([], null, null, null);
      expect(result).toEqual({ nodes: [], links: [] });
    });

    it('should build sankey model using utility method', () => {
      spyOn(FlowUtility, 'buildSankey');
      Selectors.getSankey.projector([], null, null, null);
      expect(FlowUtility.buildSankey).toHaveBeenCalled();
    });
  });

  describe('checkViaState', () => {
    it('should select products and rates', () => {
      const result = Selectors.checkViaState.projector([], {});
      expect(result).toEqual({ products: [], rates: {} });
    });
  });

  describe('getZipState', () => {
    it('should put together the required state parts', () => {
      const products = Mocks.ProductsState;
      const items = Mocks.ItemSettingsEntities;
      const recipes = Mocks.RecipeSettingsEntities;
      const factories = Mocks.FactorySettingsInitial;
      const settings = Settings.initialSettingsState;
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

  describe('getStepsModified', () => {
    it('should determine which steps have modified item or recipe settings', () => {
      const result = Selectors.getStepsModified.projector(
        Mocks.Steps,
        Items.initialItemsState,
        Recipes.initialRecipesState
      );
      expect(result.items[Mocks.Step1.itemId!]).toBeFalse();
      expect(result.recipes[Mocks.Step1.recipeId!]).toBeFalse();
    });
  });

  describe('getTotals', () => {
    it('should get totals for columns', () => {
      const result = Selectors.getTotals.projector(
        [
          {
            itemId: ItemId.Coal,
            recipeId: RecipeId.Coal,
          },
          {
            itemId: ItemId.Coal,
            recipeId: RecipeId.Coal,
            belts: Rational.one,
            wagons: Rational.one,
            factories: Rational.one,
            beacons: Rational.one,
            power: Rational.one,
            pollution: Rational.one,
          },
        ],
        Mocks.ItemSettingsInitial,
        Mocks.RecipeSettingsInitial,
        Mocks.AdjustedData
      );
      expect(result).toEqual({
        belts: { [ItemId.TransportBelt]: Rational.one },
        wagons: { [ItemId.CargoWagon]: Rational.one },
        factories: { [ItemId.ElectricMiningDrill]: Rational.one },
        beacons: { [ItemId.Beacon]: Rational.one },
        power: Rational.one,
        pollution: Rational.one,
      });
    });

    it('calculate dsp mining total by recipe', () => {
      const result = Selectors.getTotals.projector(
        [
          {
            recipeId: RecipeId.Coal,
            factories: Rational.one,
          },
        ],
        Mocks.ItemSettingsInitial,
        { [RecipeId.Coal]: { factoryId: ItemId.MiningDrill } },
        { ...Mocks.AdjustedData, ...{ game: Game.DysonSphereProgram } }
      );
      expect(result).toEqual({
        belts: {},
        wagons: {},
        factories: { [RecipeId.Coal]: Rational.one },
        beacons: {},
        power: Rational.zero,
        pollution: Rational.zero,
      });
    });
  });

  describe('getStepDetails', () => {
    it('should determine detail tabs to display for steps', () => {
      const steps: Step[] = [
        {
          id: '0',
          itemId: ItemId.PetroleumGas,
          recipeId: RecipeId.Coal,
          factories: Rational.one,
          outputs: { [ItemId.PetroleumGas]: Rational.two },
        },
        {
          id: '1',
          outputs: { [ItemId.PetroleumGas]: Rational.one },
        },
        {
          id: '2',
        },
      ];
      const data = {
        ...Mocks.AdjustedData,
        ...{
          // Manually test with one recipe which should be listed as required
          optionalRecipeIds: Mocks.AdjustedData.complexRecipeIds.filter(
            (i) => i !== RecipeId.CoalLiquefaction
          ),
        },
      };
      const result = Selectors.getStepDetails.projector(steps, data, []);
      expect(result).toEqual({
        ['0']: {
          tabs: [
            StepDetailTab.Item,
            StepDetailTab.Recipe,
            StepDetailTab.Factory,
            StepDetailTab.Recipes,
          ],
          outputs: [steps[0], steps[1]],
          recipeIds: [
            RecipeId.BasicOilProcessing,
            RecipeId.AdvancedOilProcessing,
            RecipeId.CoalLiquefaction,
            RecipeId.LightOilCracking,
            RecipeId.EmptyPetroleumGasBarrel,
          ],
          defaultableRecipeIds: [
            RecipeId.BasicOilProcessing,
            RecipeId.LightOilCracking,
          ],
        },
        ['1']: {
          tabs: [],
          outputs: [],
          recipeIds: [],
          defaultableRecipeIds: [],
        },
        ['2']: {
          tabs: [],
          outputs: [],
          recipeIds: [],
          defaultableRecipeIds: [],
        },
      });
    });
  });

  describe('getStepByItemEntities', () => {
    it('should create a map of item ids to steps', () => {
      const result = Selectors.getStepByItemEntities.projector(Mocks.Steps);
      expect(Object.keys(result).length).toEqual(Mocks.Steps.length);
    });
  });

  describe('getStepTree', () => {
    it('should map steps into a hierarchical tree', () => {
      const steps: Step[] = [
        {
          id: '0',
          recipeId: ItemId.PlasticBar,
        },
        {
          id: '1',
          recipeId: RecipeId.Coal,
          parents: {
            [RecipeId.PlasticBar]: Rational.one,
          },
        },
        {
          id: '2',
          parents: { [RecipeId.Coal]: Rational.one },
        },
        {
          id: '3',
          parents: { [RecipeId.Coal]: Rational.one },
        },
        {
          id: '4',
          parents: {
            [RecipeId.PlasticBar]: Rational.one,
          },
        },
      ];
      const result = Selectors.getStepTree.projector(steps);
      expect(result).toEqual({
        ['0']: [],
        ['1']: [true],
        ['2']: [true, true],
        ['3']: [true, false],
        ['4']: [false],
      });
    });
  });

  describe('getEffectivePrecision', () => {
    it('should calculate the effective precision for columns', () => {
      const result = Selectors.getEffectivePrecision.projector(
        [{ id: '0' }],
        Mocks.PreferencesState.columns
      );
      expect(result).toEqual({
        [Column.Surplus]: 0,
        [Column.Items]: 0,
        [Column.Belts]: 0,
        [Column.Wagons]: 0,
        [Column.Factories]: 0,
        [Column.Power]: 0,
        [Column.Pollution]: 0,
      });
    });
  });

  describe('getEffectivePowerUnit', () => {
    it('should calculate an auto power unit', () => {
      expect(
        Selectors.getEffectivePowerUnit.projector([], PowerUnit.Auto)
      ).toEqual(PowerUnit.kW);
      expect(
        Selectors.getEffectivePowerUnit.projector(
          [{ id: '0', power: Rational.thousand }],
          PowerUnit.Auto
        )
      ).toEqual(PowerUnit.MW);
      expect(
        Selectors.getEffectivePowerUnit.projector(
          [
            { id: '0', power: Rational.million },
            { id: '1', power: Rational.million },
          ],
          PowerUnit.Auto
        )
      ).toEqual(PowerUnit.GW);
    });

    it('should override with specified power unit', () => {
      expect(
        Selectors.getEffectivePowerUnit.projector([], PowerUnit.GW)
      ).toEqual(PowerUnit.GW);
    });
  });

  describe('effPrecFrom', () => {
    it('should handle null precision', () => {
      expect(Selectors.effPrecFrom([], null, () => undefined)).toBeNull();
    });

    it('should determine max decimals', () => {
      expect(
        Selectors.effPrecFrom(
          [
            { id: '0', items: Rational.from(1, 2) },
            { id: '1', items: Rational.from(1, 3) },
          ],
          3,
          (step) => step.items
        )
      ).toEqual(3);
    });
  });
});

import { ItemId, Mocks, RecipeId } from 'src/tests';
import {
  Column,
  DisplayRate,
  displayRateInfo,
  Game,
  MatrixResultType,
  PowerUnit,
  RateType,
  Rational,
  RationalProduct,
  Step,
  StepDetailTab,
} from '~/models';
import { RateUtility, RecipeUtility, SimplexUtility } from '~/utilities';
import { Producers } from '../';
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
    it('should use the utility method to determine steps', () => {
      spyOn(SimplexUtility, 'getSteps');
      Selectors.getProductSteps.projector(
        [Mocks.Product4],
        {},
        [],
        Mocks.SimplexModifiers,
        Mocks.Dataset
      );
      expect(SimplexUtility.getSteps).toHaveBeenCalled();
    });
  });

  describe('getProducts', () => {
    it('should use the utility method to adjust products', () => {
      spyOn(RecipeUtility, 'adjustProduct');
      Selectors.getProducts.projector(
        [Mocks.Product1, Mocks.Product2],
        {},
        Mocks.Dataset
      );
      expect(RecipeUtility.adjustProduct).toHaveBeenCalledTimes(2);
    });
  });

  describe('getViaOptions', () => {
    it('should map product steps to a list of options', () => {
      const result = Selectors.getViaOptions.projector(
        Mocks.ProductsList,
        Mocks.ProductSteps,
        Mocks.Dataset
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
    it('should return the rate entities', () => {
      const result = Selectors.getNormalizedRatesByItems.projector(
        [Mocks.RationalProducts[0]],
        Mocks.ProductSteps,
        displayRateInfo[DisplayRate.PerHour]
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
        displayRateInfo[DisplayRate.PerMinute]
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
        displayRateInfo[DisplayRate.PerMinute]
      );
      expect(RecipeUtility.getProductStepData).toHaveBeenCalled();
      expect(result['0']).toEqual(Rational.zero);
    });
  });

  describe('getNormalizedRatesByBelts', () => {
    it('should return the rate entities', () => {
      const result = Selectors.getNormalizedRatesByBelts.projector(
        [Mocks.RationalProducts[1]],
        Mocks.ProductSteps,
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
          ['0']: [[ItemId.IronOre, Rational.two]],
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
    it('should return the rate entities', () => {
      const result = Selectors.getNormalizedRatesByWagons.projector(
        [Mocks.RationalProducts[2]],
        Mocks.ProductSteps,
        Mocks.ItemSettingsInitial,
        displayRateInfo[DisplayRate.PerHour],
        Mocks.Dataset
      );
      expect(result[Mocks.Product3.id].nonzero()).toBeTrue();
    });

    it('should return the rate entities for items', () => {
      const result = Selectors.getNormalizedRatesByWagons.projector(
        [Mocks.RationalProducts[0]],
        Mocks.ProductSteps,
        Mocks.ItemSettingsInitial,
        displayRateInfo[DisplayRate.PerHour],
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
          ['0']: [
            [ItemId.IronOre, Rational.two],
            [ItemId.PetroleumGas, Rational.one],
          ],
          ['1']: [
            [ItemId.IronOre, Rational.two],
            [ItemId.PetroleumGas, Rational.one],
          ],
        },
        Mocks.ItemSettingsInitial,
        displayRateInfo[DisplayRate.PerMinute],
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
        displayRateInfo[DisplayRate.PerMinute],
        Mocks.AdjustedData
      );
      expect(RecipeUtility.getProductStepData).toHaveBeenCalled();
      expect(result['0']).toEqual(Rational.zero);
    });
  });

  describe('getNormalizedRatesByFactories', () => {
    it('should return the rate entities', () => {
      const result = Selectors.getNormalizedRatesByFactories.projector(
        [Mocks.RationalProducts[3]],
        Mocks.ProductSteps,
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
        Mocks.ProductSteps,
        Mocks.AdjustedData
      );
      expect(result['0'].nonzero()).toBeTrue();
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

  describe('getNormalizedProducts', () => {
    it('should map products to rates', () => {
      const result = Selectors.getNormalizedProducts.projector(
        Mocks.RationalProducts,
        { ['0']: Rational.ten }
      );
      expect(result[0].rate).toEqual(Rational.ten);
    });
  });

  describe('getMatrixResult', () => {
    it('should calculate rates using utility method', () => {
      spyOn(SimplexUtility, 'solve').and.returnValue({
        steps: [],
        resultType: MatrixResultType.Skipped,
      });
      Selectors.getMatrixResult.projector(
        [Mocks.RationalProduct],
        [],
        {},
        [],
        Mocks.SimplexModifiers,
        Mocks.Dataset
      );
      expect(SimplexUtility.solve).toHaveBeenCalled();
    });
  });

  describe('getSteps', () => {
    it('should calculate rates using utility method', () => {
      spyOn(RateUtility, 'normalizeSteps');
      Selectors.getSteps.projector(
        Mocks.MatrixResultSolved,
        [],
        {},
        {},
        null,
        {},
        displayRateInfo[DisplayRate.PerMinute],
        Mocks.Dataset
      );
      expect(RateUtility.normalizeSteps).toHaveBeenCalled();
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
      const producers = Producers.initialProducersState;
      const items = Mocks.ItemSettingsEntities;
      const recipes = Mocks.RecipeSettingsEntities;
      const factories = Mocks.FactorySettingsInitial;
      const settings = Settings.initialSettingsState;
      const result = Selectors.getZipState.projector(
        products,
        producers,
        items,
        recipes,
        factories,
        settings
      );
      expect(result.products).toBe(products);
      expect(result.producers).toBe(producers);
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
        [Mocks.Producer],
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
            id: '0',
            itemId: ItemId.Coal,
            recipeId: RecipeId.Coal,
            recipeSettings: {
              factoryModuleIds: [ItemId.ProductivityModule3],
            },
          },
          {
            id: '1',
            itemId: ItemId.Coal,
            recipeId: RecipeId.Coal,
            belts: Rational.one,
            wagons: Rational.one,
            factories: Rational.one,
            power: Rational.one,
            pollution: Rational.one,
            recipeSettings: {
              factoryModuleIds: [
                ItemId.Module,
                ItemId.SpeedModule3,
                ItemId.SpeedModule3,
              ],
            },
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
        factoryModules: {
          [ItemId.ProductivityModule3]: Rational.from(3),
        },
        beacons: { [ItemId.Beacon]: Rational.one },
        beaconModules: {
          [ItemId.SpeedModule3]: Rational.two,
        },
        power: Rational.one,
        pollution: Rational.one,
      });
    });

    it('calculate dsp mining total by recipe', () => {
      const result = Selectors.getTotals.projector(
        [
          {
            id: '0',
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
        factoryModules: {},
        beacons: {},
        beaconModules: {},
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
          items: Rational.one,
          recipeId: RecipeId.Coal,
          factories: Rational.one,
          outputs: { [ItemId.PetroleumGas]: Rational.two },
        },
        {
          id: '1',
          recipeId: RecipeId.CrudeOil,
          factories: Rational.two,
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
            { label: StepDetailTab.Item },
            { label: StepDetailTab.Recipe },
            { label: StepDetailTab.Factory },
            { label: StepDetailTab.Recipes },
          ],
          outputs: [
            {
              recipeId: RecipeId.Coal,
              producerId: undefined,
              value: Rational.two,
              factories: Rational.one,
            },
            {
              recipeId: RecipeId.CrudeOil,
              producerId: undefined,
              value: Rational.one,
              factories: Rational.two,
            },
          ],
          recipeIds: [
            RecipeId.AdvancedOilProcessing,
            RecipeId.BasicOilProcessing,
            RecipeId.CoalLiquefaction,
            RecipeId.EmptyPetroleumGasBarrel,
            RecipeId.LightOilCracking,
          ],
          defaultableRecipeIds: [
            RecipeId.BasicOilProcessing,
            RecipeId.LightOilCracking,
          ],
        },
        ['1']: {
          tabs: [
            { label: StepDetailTab.Recipe },
            { label: StepDetailTab.Factory },
          ],
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

  describe('getStepById', () => {
    it('should create a map of step ids to steps', () => {
      const result = Selectors.getStepById.projector(Mocks.Steps);
      expect(Object.keys(result).length).toEqual(Mocks.Steps.length);
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
            ['0']: Rational.one,
          },
        },
        {
          id: '2',
          parents: { ['1']: Rational.one },
        },
        {
          id: '3',
          parents: { ['1']: Rational.one },
        },
        {
          id: '4',
          parents: {
            ['0']: Rational.one,
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

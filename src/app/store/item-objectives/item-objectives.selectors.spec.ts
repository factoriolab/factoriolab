import { ItemId, Mocks, RecipeId } from 'src/tests';
import {
  Column,
  DisplayRate,
  displayRateInfo,
  Game,
  MatrixResultType,
  PowerUnit,
  RateUnit,
  Rational,
  Step,
  StepDetailTab,
} from '~/models';
import { RateUtility, SimplexUtility } from '~/utilities';
import { Producers } from '../';
import * as Items from '../items';
import * as Recipes from '../recipes';
import * as Settings from '../settings';
import * as Selectors from './item-objectives.selectors';

describe('Item Objectives Selectors', () => {
  describe('Base selector functions', () => {
    it('should get slices of state', () => {
      expect(
        Selectors.itemObjectivesState({
          productsState: Mocks.ProductsState,
        } as any)
      ).toEqual(Mocks.ProductsState);
      expect(Selectors.getIds.projector(Mocks.ProductsState)).toEqual(
        Mocks.ProductsState.ids
      );
      expect(Selectors.getEntities.projector(Mocks.ProductsState)).toEqual(
        Mocks.ProductsState.entities
      );
    });
  });

  describe('getProducts', () => {
    it('should return the array of products', () => {
      const result = Selectors.getItemObjectives.projector(
        Mocks.ProductsState.ids,
        Mocks.ProductsState.entities,
        Mocks.Dataset
      );
      expect(result.length).toEqual(Mocks.ProductIds.length);
    });
  });

  describe('getRationalProducts', () => {
    it('should map products to rational products', () => {
      const result = Selectors.getRationalItemObjectives.projector(
        Mocks.ProductsList
      );
      expect(result[0].rate.nonzero()).toBeTrue();
    });
  });

  describe('getProductsBy', () => {
    it('should handle empty/null values', () => {
      const result = Selectors.getItemObjectivesBy.projector([]);
      expect(Object.keys(result).length).toEqual(0);
    });

    it('should return the array of product ids', () => {
      const products = [...Mocks.RationalProducts, Mocks.RationalProducts[0]];
      const result = Selectors.getItemObjectivesBy.projector(products);
      expect(Object.keys(result).length).toEqual(Mocks.ProductIds.length);
    });
  });

  describe('getProductsByItems', () => {
    it('should select the products calculated by items', () => {
      expect(
        Selectors.getItemObjectivesByItems.projector({
          [AmountType.Items]: true,
        } as any)
      ).toBeTrue();
    });
  });

  describe('getProductsByBelts', () => {
    it('should select the products calculated by belts', () => {
      expect(
        Selectors.getItemObjectivesByBelts.projector({
          [AmountType.Belts]: true,
        } as any)
      ).toBeTrue();
    });
  });

  describe('getProductsByWagons', () => {
    it('should select the products calculated by wagons', () => {
      expect(
        Selectors.getItemObjectivesByWagons.projector({
          [AmountType.Wagons]: true,
        } as any)
      ).toBeTrue();
    });
  });

  describe('getNormalizedRatesByItems', () => {
    it('should return the rate entities', () => {
      const result = Selectors.getNormalizedRatesByItems.projector(
        [Mocks.RationalProducts[0]],
        displayRateInfo[DisplayRate.PerHour]
      );
      expect(result[Mocks.Product1.id].nonzero()).toBeTrue();
    });
  });

  describe('getNormalizedRatesByBelts', () => {
    it('should return the rate entities', () => {
      const result = Selectors.getNormalizedRatesByBelts.projector(
        [Mocks.RationalProducts[1]],
        { [Mocks.Product2.itemId]: Mocks.ItemSettings1 },
        { [Mocks.ItemSettings1.beltId!]: Rational.one }
      );
      expect(result[Mocks.Product2.id].nonzero()).toBeTrue();
    });
  });

  describe('getNormalizedRatesByWagons', () => {
    it('should return the rate entities', () => {
      const result = Selectors.getNormalizedRatesByWagons.projector(
        [Mocks.RationalProducts[2]],
        Mocks.ItemSettingsInitial,
        displayRateInfo[DisplayRate.PerHour],
        Mocks.Dataset
      );
      expect(result[Mocks.Product3.id].nonzero()).toBeTrue();
    });

    it('should return the rate entities for items', () => {
      const result = Selectors.getNormalizedRatesByWagons.projector(
        [Mocks.RationalProducts[0]],
        Mocks.ItemSettingsInitial,
        displayRateInfo[DisplayRate.PerHour],
        Mocks.Dataset
      );
      expect(result[Mocks.Product1.id].nonzero()).toBeTrue();
    });
  });

  describe('getNormalizedRates', () => {
    it('should handle empty/null values', () => {
      const result = Selectors.getNormalizedRates.projector({}, {}, {});
      expect(Object.keys(result).length).toEqual(0);
    });
  });

  describe('getNormalizedProducts', () => {
    it('should map products to rates', () => {
      const result = Selectors.getNormalizedItemObjectives.projector(
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

  describe('getZipState', () => {
    it('should put together the required state parts', () => {
      const products = Mocks.ProductsState;
      const producers = Producers.initialProducersState;
      const items = Mocks.ItemSettingsEntities;
      const recipes = Mocks.RecipeSettingsEntities;
      const machines = Mocks.MachineSettingsInitial;
      const settings = Settings.initialSettingsState;
      const result = Selectors.getZipState.projector(
        products,
        producers,
        items,
        recipes,
        machines,
        settings
      );
      expect(result.products).toBe(products);
      expect(result.producers).toBe(producers);
      expect(result.items).toBe(items);
      expect(result.recipes).toBe(recipes);
      expect(result.machines).toBe(machines);
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
              machineModuleIds: [ItemId.ProductivityModule3],
              beacons: [
                {
                  id: ItemId.Beacon,
                },
              ],
            },
          },
          {
            id: '1',
            itemId: ItemId.Coal,
            recipeId: RecipeId.Coal,
            belts: Rational.one,
            wagons: Rational.one,
            machines: Rational.one,
            power: Rational.one,
            pollution: Rational.one,
            recipeSettings: {
              machineModuleIds: [
                ItemId.Module,
                ItemId.SpeedModule3,
                ItemId.SpeedModule3,
              ],
              beacons: [
                {
                  total: Rational.one,
                  id: ItemId.Beacon,
                  moduleIds: [ItemId.SpeedModule3, ItemId.SpeedModule3],
                },
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
        machines: { [ItemId.ElectricMiningDrill]: Rational.one },
        machineModules: {
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
            machines: Rational.one,
          },
        ],
        Mocks.ItemSettingsInitial,
        { [RecipeId.Coal]: { machineId: ItemId.MiningDrill } },
        { ...Mocks.AdjustedData, ...{ game: Game.DysonSphereProgram } }
      );
      expect(result).toEqual({
        belts: {},
        wagons: {},
        machines: { [RecipeId.Coal]: Rational.one },
        machineModules: {},
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
          machines: Rational.one,
          outputs: { [ItemId.PetroleumGas]: Rational.two },
        },
        {
          id: '1',
          recipeId: RecipeId.CrudeOil,
          machines: Rational.two,
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
            {
              label: StepDetailTab.Item,
              id: 'step_0_item_tab',
              url: '#step_0_item',
              target: '_self',
            },
            {
              label: StepDetailTab.Recipe,
              id: 'step_0_recipe_tab',
              url: '#step_0_recipe',
              target: '_self',
            },
            {
              label: StepDetailTab.Machine,
              id: 'step_0_machine_tab',
              url: '#step_0_machine',
              target: '_self',
            },
            {
              label: StepDetailTab.Recipes,
              id: 'step_0_recipes_tab',
              url: '#step_0_recipes',
              target: '_self',
            },
          ],
          outputs: [
            {
              recipeId: RecipeId.Coal,
              recipeObjectiveId: undefined,
              value: Rational.two,
              machines: Rational.one,
            },
            {
              recipeId: RecipeId.CrudeOil,
              recipeObjectiveId: undefined,
              value: Rational.one,
              machines: Rational.two,
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
            {
              label: StepDetailTab.Recipe,
              id: 'step_1_recipe_tab',
              url: '#step_1_recipe',
              target: '_self',
            },
            {
              label: StepDetailTab.Machine,
              id: 'step_1_machine_tab',
              url: '#step_1_machine',
              target: '_self',
            },
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
        [Column.Machines]: 0,
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

import { ItemId, Mocks, RecipeId } from 'src/tests';
import {
  DisplayRate,
  displayRateInfo,
  Game,
  MatrixResultType,
  MaximizeType,
  PowerUnit,
  Rational,
  Step,
  StepDetailTab,
} from '~/models';
import { RateUtility, SimplexUtility } from '~/utilities';
import { RecipeObjectives } from '../';
import * as Items from '../items';
import * as Recipes from '../recipes';
import * as Settings from '../settings';
import * as Selectors from './item-objectives.selectors';

describe('Item Objectives Selectors', () => {
  describe('Base selector functions', () => {
    it('should get slices of state', () => {
      expect(
        Selectors.itemObjectivesState({
          itemObjectivesState: Mocks.ItemObjectivesState,
        } as any)
      ).toEqual(Mocks.ItemObjectivesState);
      expect(Selectors.getIds.projector(Mocks.ItemObjectivesState)).toEqual(
        Mocks.ItemObjectivesState.ids
      );
      expect(
        Selectors.getEntities.projector(Mocks.ItemObjectivesState)
      ).toEqual(Mocks.ItemObjectivesState.entities);
    });
  });

  describe('getItemObjectives', () => {
    it('should return the array of objectives', () => {
      const result = Selectors.getItemObjectives.projector(
        Mocks.ItemObjectivesState.ids,
        Mocks.ItemObjectivesState.entities,
        Mocks.Dataset
      );
      expect(result.length).toEqual(Mocks.ItemObjectiveIds.length);
    });
  });

  describe('getRationalItemObjectives', () => {
    it('should map objectives to rational objectives', () => {
      const result = Selectors.getItemObjectiveRationals.projector(
        Mocks.ItemObjectivesList
      );
      expect(result[0].rate.nonzero()).toBeTrue();
    });
  });

  describe('getNormalizedItemObjectives', () => {
    it('should map objectives to rates', () => {
      spyOn(RateUtility, 'itemObjectiveNormalizedRate');
      Selectors.getNormalizedItemObjectives.projector(
        Mocks.RationalItemObjectives,
        Mocks.ItemsStateInitial,
        Mocks.BeltSpeed,
        displayRateInfo[DisplayRate.PerMinute],
        Mocks.Dataset
      );
      expect(RateUtility.itemObjectiveNormalizedRate).toHaveBeenCalledTimes(
        Mocks.RationalItemObjectives.length
      );
    });
  });

  describe('getMatrixResult', () => {
    it('should calculate rates using utility method', () => {
      spyOn(SimplexUtility, 'solve').and.returnValue({
        steps: [],
        resultType: MatrixResultType.Skipped,
      });
      Selectors.getMatrixResult.projector(
        Mocks.RationalItemObjectives,
        Mocks.RationalRecipeObjectives,
        Mocks.ItemsStateInitial,
        Mocks.RecipesStateInitial,
        [],
        MaximizeType.Weight,
        Mocks.CostRational,
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
      const itemObjectives = Mocks.ItemObjectivesState;
      const recipeObjectives = RecipeObjectives.initialRecipeObjectivesState;
      const itemsState = Mocks.ItemsState;
      const recipesState = Mocks.RecipesState;
      const machinesState = Mocks.MachinesStateInitial;
      const settings = Settings.initialSettingsState;
      const result = Selectors.getZipState.projector(
        itemObjectives,
        recipeObjectives,
        itemsState,
        recipesState,
        machinesState,
        settings
      );
      expect(result.itemObjectives).toBe(itemObjectives);
      expect(result.recipeObjectives).toBe(recipeObjectives);
      expect(result.itemsState).toBe(itemsState);
      expect(result.recipesState).toBe(recipesState);
      expect(result.machinesState).toBe(machinesState);
      expect(result.settings).toBe(settings);
    });
  });

  describe('getStepsModified', () => {
    it('should determine which steps have modified item or recipe settings', () => {
      const result = Selectors.getStepsModified.projector(
        Mocks.Steps,
        Mocks.RecipeObjectivesList,
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
            recipe: Mocks.AdjustedData.recipeR[RecipeId.Coal],
            recipeSettings: {
              machineId: ItemId.ElectricMiningDrill,
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
            recipe: Mocks.AdjustedData.recipeR[RecipeId.Coal],
            recipeSettings: {
              machineId: ItemId.ElectricMiningDrill,
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
        Mocks.ItemsStateInitial,
        Mocks.RecipesStateInitial,
        Mocks.AdjustedData
      );
      expect(result).toEqual({
        belts: { [ItemId.TransportBelt]: Rational.one },
        wagons: { [ItemId.CargoWagon]: Rational.one },
        machines: { [ItemId.ElectricMiningDrill]: Rational.one },
        machineModules: {
          [ItemId.SpeedModule3]: Rational.from(2),
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
            recipe: Mocks.AdjustedData.recipeR[RecipeId.Coal],
            machines: Rational.one,
            recipeSettings: {
              machineId: ItemId.MiningDrill,
            },
          },
        ],
        Mocks.ItemsStateInitial,
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
      const result = Selectors.getStepDetails.projector(
        steps,
        Mocks.AdjustedData,
        Mocks.Dataset.recipeIds
      );
      expect(result).toEqual({
        ['0']: {
          tabs: [
            {
              label: StepDetailTab.Item,
              id: 'step_0_item_tab',
              command: result['0'].tabs[0].command,
            },
            {
              label: StepDetailTab.Recipe,
              id: 'step_0_recipe_tab',
              command: result['0'].tabs[1].command,
            },
            {
              label: StepDetailTab.Machine,
              id: 'step_0_machine_tab',
              command: result['0'].tabs[2].command,
            },
            {
              label: StepDetailTab.Recipes,
              id: 'step_0_recipes_tab',
              command: result['0'].tabs[3].command,
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
            {
              inputs: true,
              value: Rational.from(-2),
              machines: Rational.zero,
            },
          ],
          recipeIds: [
            RecipeId.BasicOilProcessing,
            RecipeId.AdvancedOilProcessing,
            RecipeId.CoalLiquefaction,
            RecipeId.LightOilCracking,
            RecipeId.EmptyPetroleumGasBarrel,
          ],
        },
        ['1']: {
          tabs: [
            {
              label: StepDetailTab.Recipe,
              id: 'step_1_recipe_tab',
              command: result['1'].tabs[0].command,
            },
            {
              label: StepDetailTab.Machine,
              id: 'step_1_machine_tab',
              command: result['1'].tabs[1].command,
            },
          ],
          outputs: [],
          recipeIds: [],
        },
        ['2']: {
          tabs: [],
          outputs: [],
          recipeIds: [],
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

  // describe('getEffectivePrecision', () => {
  //   it('should calculate the effective precision for columns', () => {
  //     const result = Selectors.getEffectivePrecision.projector(
  //       [{ id: '0' }],
  //       Mocks.PreferencesState.columns
  //     );
  //     expect(result).toEqual({
  //       [Column.Surplus]: 0,
  //       [Column.Items]: 0,
  //       [Column.Belts]: 0,
  //       [Column.Wagons]: 0,
  //       [Column.Machines]: 0,
  //       [Column.Power]: 0,
  //       [Column.Pollution]: 0,
  //     });
  //   });
  // });

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

  // describe('effPrecFrom', () => {
  //   it('should handle null precision', () => {
  //     expect(Selectors.effPrecFrom([], null, () => undefined)).toBeNull();
  //   });

  //   it('should determine max decimals', () => {
  //     expect(
  //       Selectors.effPrecFrom(
  //         [
  //           { id: '0', items: Rational.from(1, 2) },
  //           { id: '1', items: Rational.from(1, 3) },
  //         ],
  //         3,
  //         (step) => step.items
  //       )
  //     ).toEqual(3);
  //   });
  // });
});

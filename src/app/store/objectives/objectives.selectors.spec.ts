import { ItemId, Mocks, RecipeId } from 'src/tests';
import {
  DisplayRate,
  displayRateInfo,
  Game,
  MaximizeType,
  Objective,
  ObjectiveType,
  ObjectiveUnit,
  PowerUnit,
  Rational,
  SimplexResultType,
  Step,
  StepDetailTab,
} from '~/models';
import { RateUtility, RecipeUtility, SimplexUtility } from '~/utilities';
import * as Items from '../items';
import * as Recipes from '../recipes';
import * as Settings from '../settings';
import * as Selectors from './objectives.selectors';

describe('Objectives Selectors', () => {
  describe('Base selector functions', () => {
    it('should get slices of state', () => {
      expect(
        Selectors.objectivesState({
          objectivesState: Mocks.ObjectivesState,
        } as any),
      ).toEqual(Mocks.ObjectivesState);
      expect(Selectors.getIds.projector(Mocks.ObjectivesState)).toEqual(
        Mocks.ObjectivesState.ids,
      );
      expect(Selectors.getEntities.projector(Mocks.ObjectivesState)).toEqual(
        Mocks.ObjectivesState.entities,
      );
    });
  });

  describe('getBaseObjectives', () => {
    it('should return the array of objectives', () => {
      const result = Selectors.getBaseObjectives.projector(
        Mocks.ObjectivesState.ids,
        Mocks.ObjectivesState.entities,
        Mocks.RawDataset,
      );
      expect(result).toEqual(Mocks.ObjectivesList);
    });
  });

  describe('getObjectives', () => {
    it('should adjust recipe objectives based on settings', () => {
      spyOn(RecipeUtility, 'adjustObjective');
      Selectors.getObjectives.projector(
        [Mocks.Objective5],
        Mocks.MachinesStateInitial,
        Mocks.RawDataset,
      );
      expect(RecipeUtility.adjustObjective).toHaveBeenCalledWith(
        Mocks.Objective5,
        Mocks.MachinesStateInitial,
        Mocks.RawDataset,
      );
    });
  });

  describe('getObjectiveRationals', () => {
    it('should convert objectives to rationals', () => {
      const data = Mocks.getDataset();
      spyOn(RecipeUtility, 'adjustRecipe').and.callThrough();
      Selectors.getObjectiveRationals.projector(
        [Mocks.Objective1, Mocks.Objective5],
        Mocks.AdjustmentData,
        Mocks.ItemsStateInitial,
        Mocks.RecipesStateRationalInitial,
        data,
      );
      expect(RecipeUtility.adjustRecipe).toHaveBeenCalledTimes(1);
    });
  });

  describe('getNormalizedObjectives', () => {
    it('should map objectives to rates', () => {
      spyOn(RateUtility, 'objectiveNormalizedRate');
      Selectors.getNormalizedObjectives.projector(
        Mocks.RationalObjectives,
        Mocks.ItemsStateInitial,
        Mocks.BeltSpeed,
        displayRateInfo[DisplayRate.PerMinute],
        Mocks.Dataset,
      );
      expect(RateUtility.objectiveNormalizedRate).toHaveBeenCalledTimes(
        Mocks.RationalObjectives.length,
      );
    });
  });

  describe('getMatrixResult', () => {
    it('should calculate rates using utility method', () => {
      spyOn(SimplexUtility, 'solve').and.returnValue({
        steps: [],
        resultType: SimplexResultType.Skipped,
      });
      Selectors.getMatrixResult.projector(
        Mocks.RationalObjectives,
        Mocks.ItemsStateInitial,
        Mocks.RecipesStateInitial,
        [],
        MaximizeType.Weight,
        false,
        Mocks.CostRational,
        Mocks.Dataset,
        false,
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
        Mocks.Dataset,
      );
      expect(RateUtility.normalizeSteps).toHaveBeenCalled();
    });
  });

  describe('getZipState', () => {
    it('should put together the required state parts', () => {
      const objectives = Mocks.ObjectivesState;
      const itemsState = Mocks.ItemsState;
      const recipesState = Mocks.RecipesState;
      const machinesState = Mocks.MachinesStateInitial;
      const settings = Settings.initialSettingsState;
      const result = Selectors.getZipState.projector(
        objectives,
        itemsState,
        recipesState,
        machinesState,
        settings,
      );
      expect(result.objectives).toBe(objectives);
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
        Mocks.ObjectivesList,
        Items.initialItemsState,
        Recipes.initialRecipesState,
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
            recipe: Mocks.Dataset.recipeR[RecipeId.Coal],
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
            recipe: Mocks.Dataset.recipeR[RecipeId.Coal],
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
        Mocks.Dataset,
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
            id: '01',
            recipeId: RecipeId.Coal,
            recipe: Mocks.Dataset.recipeR[RecipeId.Coal],
            machines: Rational.one,
            recipeSettings: {
              machineId: ItemId.MiningMachine,
            },
          },
        ],
        Mocks.ItemsStateInitial,
        { ...Mocks.Dataset, ...{ game: Game.DysonSphereProgram } },
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
        Mocks.RecipesStateInitial,
        Mocks.Dataset,
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
            RecipeId.CoalLiquefactionSteam500,
            RecipeId.LightOilCracking,
          ],
          allRecipesIncluded: true,
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
          allRecipesIncluded: true,
        },
        ['2']: {
          tabs: [],
          outputs: [],
          recipeIds: [],
          allRecipesIncluded: true,
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

  describe('getEffectivePowerUnit', () => {
    it('should calculate an auto power unit', () => {
      expect(
        Selectors.getEffectivePowerUnit.projector([], PowerUnit.Auto),
      ).toEqual(PowerUnit.kW);
      expect(
        Selectors.getEffectivePowerUnit.projector(
          [{ id: '0', power: Rational.thousand }],
          PowerUnit.Auto,
        ),
      ).toEqual(PowerUnit.MW);
      expect(
        Selectors.getEffectivePowerUnit.projector(
          [
            { id: '0', power: Rational.million },
            { id: '1', power: Rational.million },
          ],
          PowerUnit.Auto,
        ),
      ).toEqual(PowerUnit.GW);
    });

    it('should override with specified power unit', () => {
      expect(
        Selectors.getEffectivePowerUnit.projector([], PowerUnit.GW),
      ).toEqual(PowerUnit.GW);
    });
  });

  describe('getRecipesModified', () => {
    it('should determine whether columns are modified', () => {
      const result = Selectors.getRecipesModified.projector(
        {
          [RecipeId.Coal]: {
            machineId: undefined,
            machineModuleIds: undefined,
            overclock: 100,
            beacons: [{ total: '1' }],
          },
        },
        [],
      );
      expect(result.machines).toBeTrue();
      expect(result.beacons).toBeTrue();
      expect(result.cost).toBeFalse();
    });

    it('should account for recipe objective settings', () => {
      const objective: Objective = {
        id: '1',
        targetId: RecipeId.Coal,
        value: '1',
        unit: ObjectiveUnit.Machines,
        type: ObjectiveType.Output,
        overclock: 100,
        beacons: [{ moduleIds: [] }],
      };
      const result = Selectors.getRecipesModified.projector(
        {
          [RecipeId.Coal]: {},
        },
        [objective],
      );
      expect(result.machines).toBeTrue();
      expect(result.beacons).toBeTrue();
      expect(result.cost).toBeFalse();
    });
  });
});

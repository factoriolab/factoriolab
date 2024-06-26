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
  rational,
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
        Mocks.AdjustedDataset,
      );
      expect(result).toEqual(Mocks.ObjectivesList);
    });
  });

  describe('getObjectives', () => {
    it('should adjust recipe objectives based on settings', () => {
      spyOn(RecipeUtility, 'adjustObjective');
      Selectors.getObjectives.projector(
        [Mocks.Objective5],
        Mocks.ItemsStateInitial,
        Mocks.RecipesStateInitial,
        Mocks.MachinesStateInitial,
        Mocks.AdjustmentData,
        Mocks.AdjustedDataset,
      );
      expect(RecipeUtility.adjustObjective).toHaveBeenCalledWith(
        Mocks.Objective5,
        Mocks.ItemsStateInitial,
        Mocks.RecipesStateInitial,
        Mocks.MachinesStateInitial,
        Mocks.AdjustmentData,
        Mocks.AdjustedDataset,
      );
    });
  });

  describe('getNormalizedObjectives', () => {
    it('should map objectives to rates', () => {
      spyOn(RateUtility, 'objectiveNormalizedRate');
      Selectors.getNormalizedObjectives.projector(
        Mocks.Objectives,
        Mocks.ItemsStateInitial,
        Mocks.BeltSpeed,
        displayRateInfo[DisplayRate.PerMinute],
        Mocks.AdjustedDataset,
      );
      expect(RateUtility.objectiveNormalizedRate).toHaveBeenCalledTimes(
        Mocks.Objectives.length,
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
        Mocks.Objectives,
        Mocks.ItemsStateInitial,
        Mocks.RecipesStateInitial,
        [],
        MaximizeType.Weight,
        false,
        Mocks.Costs,
        Mocks.AdjustedDataset,
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
        Mocks.AdjustedDataset,
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
            recipe: Mocks.AdjustedDataset.adjustedRecipe[RecipeId.Coal],
            recipeSettings: {
              machineId: ItemId.ElectricMiningDrill,
              modules: [
                {
                  count: rational(3n),
                  id: ItemId.ProductivityModule3,
                },
              ],
              beacons: [
                {
                  count: rational(0n),
                  id: ItemId.Beacon,
                  modules: [{ count: rational(2n), id: ItemId.Module }],
                },
              ],
            },
          },
          {
            id: '1',
            itemId: ItemId.Coal,
            recipeId: RecipeId.Coal,
            belts: rational(1n),
            wagons: rational(1n),
            machines: rational(1n),
            power: rational(1n),
            pollution: rational(1n),
            recipe: Mocks.AdjustedDataset.adjustedRecipe[RecipeId.Coal],
            recipeSettings: {
              machineId: ItemId.ElectricMiningDrill,
              modules: [
                { count: rational(1n), id: ItemId.Module },
                { count: rational(2n), id: ItemId.SpeedModule3 },
              ],
              beacons: [
                {
                  count: rational(2n),
                  id: ItemId.Beacon,
                  modules: [{ count: rational(2n), id: ItemId.SpeedModule3 }],
                  total: rational(1n),
                },
              ],
            },
          },
        ],
        Mocks.ItemsStateInitial,
        Mocks.AdjustedDataset,
      );
      expect(result).toEqual({
        belts: { [ItemId.TransportBelt]: rational(1n) },
        wagons: { [ItemId.CargoWagon]: rational(1n) },
        machines: { [ItemId.ElectricMiningDrill]: rational(1n) },
        modules: {
          [ItemId.SpeedModule3]: rational(2n),
        },
        beacons: { [ItemId.Beacon]: rational(1n) },
        beaconModules: {
          [ItemId.SpeedModule3]: rational(2n),
        },
        power: rational(1n),
        pollution: rational(1n),
      });
    });

    it('should calculate dsp mining total by recipe', () => {
      const result = Selectors.getTotals.projector(
        [
          {
            id: '01',
            recipeId: RecipeId.Coal,
            recipe: Mocks.AdjustedDataset.adjustedRecipe[RecipeId.Coal],
            machines: rational(1n),
            recipeSettings: {
              machineId: ItemId.MiningMachine,
            },
          },
        ],
        Mocks.ItemsStateInitial,
        { ...Mocks.AdjustedDataset, ...{ game: Game.DysonSphereProgram } },
      );
      expect(result).toEqual({
        belts: {},
        wagons: {},
        machines: { [RecipeId.Coal]: rational(1n) },
        modules: {},
        beacons: {},
        beaconModules: {},
        power: rational(0n),
        pollution: rational(0n),
      });
    });

    it('should calculate Final Factory duplicator total', () => {
      const result = Selectors.getTotals.projector(
        [
          {
            id: '01',
            recipeId: RecipeId.Coal,
            recipe: Mocks.AdjustedDataset.adjustedRecipe[RecipeId.Coal],
            machines: rational(1n),
            recipeSettings: {
              machineId: ItemId.AssemblingMachine2,
              modules: [{ count: rational(1n), id: ItemId.SpeedModule }],
              overclock: rational(2n),
            },
          },
        ],
        Mocks.ItemsStateInitial,
        { ...Mocks.AdjustedDataset, ...{ game: Game.FinalFactory } },
      );
      expect(result).toEqual({
        belts: {},
        wagons: {},
        machines: { [ItemId.AssemblingMachine2]: rational(1n) },
        modules: { [ItemId.SpeedModule]: rational(2n) },
        beacons: {},
        beaconModules: {},
        power: rational(0n),
        pollution: rational(0n),
      });
    });
  });

  describe('getStepDetails', () => {
    it('should determine detail tabs to display for steps', () => {
      const steps: Step[] = [
        {
          id: '0',
          itemId: ItemId.PetroleumGas,
          items: rational(1n),
          recipeId: RecipeId.Coal,
          machines: rational(1n),
          outputs: { [ItemId.PetroleumGas]: rational(2n) },
        },
        {
          id: '1',
          recipeId: RecipeId.CrudeOil,
          machines: rational(2n),
          outputs: { [ItemId.PetroleumGas]: rational(1n) },
        },
        {
          id: '2',
        },
      ];
      const result = Selectors.getStepDetails.projector(
        steps,
        Mocks.RecipesStateInitial,
        Mocks.AdjustedDataset,
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
              value: rational(2n),
              step: steps[0],
            },
            {
              value: rational(1n),
              step: steps[1],
            },
            {
              inputs: true,
              value: rational(-2n),
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
            ['0']: rational(1n),
          },
        },
        {
          id: '2',
          parents: { ['1']: rational(1n) },
        },
        {
          id: '3',
          parents: { ['1']: rational(1n) },
        },
        {
          id: '4',
          parents: {
            ['0']: rational(1n),
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
          [{ id: '0', power: rational(1000n) }],
          PowerUnit.Auto,
        ),
      ).toEqual(PowerUnit.MW);
      expect(
        Selectors.getEffectivePowerUnit.projector(
          [
            { id: '0', power: rational(1000000n) },
            { id: '1', power: rational(1000000n) },
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
            modules: undefined,
            overclock: rational(100n),
            beacons: [
              {
                count: rational(1n),
                id: ItemId.Beacon,
                modules: [{ count: rational(2n), id: ItemId.Module }],
                total: rational(1n),
              },
            ],
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
        value: rational(1n),
        unit: ObjectiveUnit.Machines,
        type: ObjectiveType.Output,
        overclock: rational(100n),
        beacons: [
          {
            count: rational(1n),
            id: ItemId.Beacon,
            modules: [{ count: rational(2n), id: ItemId.Module }],
          },
        ],
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

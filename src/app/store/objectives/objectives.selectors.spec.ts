import { ItemId, Mocks, RecipeId } from 'src/tests';

import {
  DisplayRate,
  displayRateInfo,
  Game,
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
import * as Selectors from './objectives.selectors';

describe('Objectives Selectors', () => {
  describe('Base selector functions', () => {
    it('should get slices of state', () => {
      expect(
        Selectors.objectivesState({
          objectivesState: Mocks.ObjectivesState,
        } as any),
      ).toEqual(Mocks.ObjectivesState);
      expect(Selectors.selectIds.projector(Mocks.ObjectivesState)).toEqual(
        Mocks.ObjectivesState.ids,
      );
      expect(Selectors.selectEntities.projector(Mocks.ObjectivesState)).toEqual(
        Mocks.ObjectivesState.entities,
      );
    });
  });

  describe('selectBaseObjectives', () => {
    it('should return the array of objectives', () => {
      const result = Selectors.selectBaseObjectives.projector(
        Mocks.ObjectivesState.ids,
        Mocks.ObjectivesState.entities,
        Mocks.AdjustedDataset,
      );
      expect(result).toEqual(Mocks.ObjectivesList);
    });
  });

  describe('selectObjectives', () => {
    it('should adjust recipe objectives based on settings', () => {
      spyOn(RecipeUtility, 'adjustObjective');
      Selectors.selectObjectives.projector(
        [Mocks.Objective5],
        Mocks.ItemsStateInitial,
        Mocks.RecipesStateInitial,
        Mocks.MachinesStateInitial,
        Mocks.SettingsStateInitial,
        Mocks.AdjustedDataset,
      );
      expect(RecipeUtility.adjustObjective).toHaveBeenCalledWith(
        Mocks.Objective5,
        Mocks.ItemsStateInitial,
        Mocks.RecipesStateInitial,
        Mocks.MachinesStateInitial,
        Mocks.SettingsStateInitial,
        Mocks.AdjustedDataset,
      );
    });
  });

  describe('selectNormalizedObjectives', () => {
    it('should map objectives to rates', () => {
      spyOn(RateUtility, 'objectiveNormalizedRate');
      Selectors.selectNormalizedObjectives.projector(
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

  describe('selectMatrixResult', () => {
    it('should calculate rates using utility method', () => {
      spyOn(SimplexUtility, 'solve').and.returnValue({
        steps: [],
        resultType: SimplexResultType.Skipped,
      });
      Selectors.selectMatrixResult.projector(
        Mocks.Objectives,
        Mocks.SettingsStateInitial,
        Mocks.AdjustedDataset,
        false,
      );
      expect(SimplexUtility.solve).toHaveBeenCalled();
    });
  });

  describe('selectSteps', () => {
    it('should calculate rates using utility method', () => {
      spyOn(RateUtility, 'normalizeSteps');
      Selectors.selectSteps.projector(
        Mocks.MatrixResultSolved,
        [],
        {},
        {},

        {},
        displayRateInfo[DisplayRate.PerMinute],
        Mocks.SettingsStateInitial,
        Mocks.AdjustedDataset,
      );
      expect(RateUtility.normalizeSteps).toHaveBeenCalled();
    });
  });

  describe('selectZipState', () => {
    it('should put together the required state parts', () => {
      const objectives = Mocks.ObjectivesState;
      const itemsState = Mocks.ItemsState;
      const recipesState = Mocks.RecipesState;
      const machinesState = Mocks.MachinesStateInitial;
      const settings = Mocks.SettingsStateInitial;
      const data = Mocks.Dataset;
      const hash = Mocks.Hash;
      const result = Selectors.selectZipState.projector(
        objectives,
        itemsState,
        recipesState,
        machinesState,
        settings,
        data,
        hash,
      );
      expect(result.objectives).toBe(objectives);
      expect(result.itemsState).toBe(itemsState);
      expect(result.recipesState).toBe(recipesState);
      expect(result.machinesState).toBe(machinesState);
      expect(result.settings).toBe(settings);
    });
  });

  describe('selectStepsModified', () => {
    it('should determine which steps have modified item or recipe settings', () => {
      const result = Selectors.selectStepsModified.projector(
        Mocks.Steps,
        Mocks.ObjectivesList,
        Items.initialState,
        Recipes.initialState,
      );
      expect(result.items[Mocks.Step1.itemId!]).toBeFalse();
      expect(result.recipes[Mocks.Step1.recipeId!]).toBeFalse();
    });
  });

  describe('selectTotals', () => {
    it('should get totals for columns', () => {
      const result = Selectors.selectTotals.projector(
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
                  count: rational.zero,
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
            belts: rational.one,
            wagons: rational.one,
            machines: rational.one,
            power: rational.one,
            pollution: rational.one,
            recipe: Mocks.AdjustedDataset.adjustedRecipe[RecipeId.Coal],
            recipeSettings: {
              machineId: ItemId.ElectricMiningDrill,
              modules: [
                { count: rational.one, id: ItemId.Module },
                { count: rational(2n), id: ItemId.SpeedModule3 },
              ],
              beacons: [
                {
                  count: rational(2n),
                  id: ItemId.Beacon,
                  modules: [
                    { count: rational.one, id: ItemId.SpeedModule3 },
                    { count: rational.one, id: ItemId.Module },
                  ],
                  total: rational.one,
                },
              ],
            },
          },
        ],
        Mocks.ItemsStateInitial,
        Mocks.AdjustedDataset,
      );
      expect(result).toEqual({
        belts: { [ItemId.ExpressTransportBelt]: rational.one },
        wagons: { [ItemId.CargoWagon]: rational.one },
        machines: { [ItemId.ElectricMiningDrill]: rational.one },
        modules: {
          [ItemId.SpeedModule3]: rational(2n),
        },
        beacons: { [ItemId.Beacon]: rational.one },
        beaconModules: {
          [ItemId.SpeedModule3]: rational.one,
        },
        power: rational.one,
        pollution: rational.one,
      });
    });

    it('should calculate dsp mining total by recipe', () => {
      const result = Selectors.selectTotals.projector(
        [
          {
            id: '01',
            recipeId: RecipeId.Coal,
            recipe: Mocks.AdjustedDataset.adjustedRecipe[RecipeId.Coal],
            machines: rational.one,
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
        machines: { [RecipeId.Coal]: rational.one },
        modules: {},
        beacons: {},
        beaconModules: {},
        power: rational.zero,
        pollution: rational.zero,
      });
    });
  });

  describe('selectStepDetails', () => {
    it('should determine detail tabs to display for steps', () => {
      const steps: Step[] = [
        {
          id: '0',
          itemId: ItemId.PetroleumGas,
          items: rational.one,
          recipeId: RecipeId.Coal,
          machines: rational.one,
          outputs: { [ItemId.PetroleumGas]: rational(2n) },
        },
        {
          id: '1',
          recipeId: RecipeId.CrudeOil,
          machines: rational(2n),
          outputs: { [ItemId.PetroleumGas]: rational.one },
        },
        {
          id: '2',
        },
      ];
      const result = Selectors.selectStepDetails.projector(
        steps,
        Mocks.SettingsStateInitial,
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
              value: rational.one,
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

  describe('selectStepById', () => {
    it('should create a map of step ids to steps', () => {
      const result = Selectors.selectStepById.projector(Mocks.Steps);
      expect(Object.keys(result).length).toEqual(Mocks.Steps.length);
    });
  });

  describe('selectStepByItemEntities', () => {
    it('should create a map of item ids to steps', () => {
      const result = Selectors.selectStepByItemEntities.projector(Mocks.Steps);
      expect(Object.keys(result).length).toEqual(Mocks.Steps.length);
    });
  });

  describe('selectStepTree', () => {
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
            ['0']: rational.one,
          },
        },
        {
          id: '2',
          parents: { ['1']: rational.one },
        },
        {
          id: '3',
          parents: { ['1']: rational.one },
        },
        {
          id: '4',
          parents: {
            ['0']: rational.one,
          },
        },
      ];
      const result = Selectors.selectStepTree.projector(steps);
      expect(result).toEqual({
        ['0']: [],
        ['1']: [true],
        ['2']: [true, true],
        ['3']: [true, false],
        ['4']: [false],
      });
    });
  });

  describe('selectEffectivePowerUnit', () => {
    it('should calculate an auto power unit', () => {
      expect(
        Selectors.selectEffectivePowerUnit.projector([], PowerUnit.Auto),
      ).toEqual(PowerUnit.kW);
      expect(
        Selectors.selectEffectivePowerUnit.projector(
          [{ id: '0', power: rational(1000n) }],
          PowerUnit.Auto,
        ),
      ).toEqual(PowerUnit.MW);
      expect(
        Selectors.selectEffectivePowerUnit.projector(
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
        Selectors.selectEffectivePowerUnit.projector([], PowerUnit.GW),
      ).toEqual(PowerUnit.GW);
    });
  });

  describe('selectRecipesModified', () => {
    it('should determine whether columns are modified', () => {
      const result = Selectors.selectRecipesModified.projector(
        {
          [RecipeId.Coal]: {
            machineId: undefined,
            modules: undefined,
            overclock: rational(100n),
            beacons: [
              {
                count: rational.one,
                id: ItemId.Beacon,
                modules: [{ count: rational(2n), id: ItemId.Module }],
                total: rational.one,
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
        value: rational.one,
        unit: ObjectiveUnit.Machines,
        type: ObjectiveType.Output,
        overclock: rational(100n),
        beacons: [
          {
            count: rational.one,
            id: ItemId.Beacon,
            modules: [{ count: rational(2n), id: ItemId.Module }],
          },
        ],
      };
      const result = Selectors.selectRecipesModified.projector(
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

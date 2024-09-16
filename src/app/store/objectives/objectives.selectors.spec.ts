import { DisplayRate, displayRateInfo } from '~/models/enum/display-rate';
import { Game } from '~/models/enum/game';
import { ObjectiveType } from '~/models/enum/objective-type';
import { ObjectiveUnit } from '~/models/enum/objective-unit';
import { PowerUnit } from '~/models/enum/power-unit';
import { SimplexResultType } from '~/models/enum/simplex-result-type';
import { StepDetailTab } from '~/models/enum/step-detail-tab';
import { Objective } from '~/models/objective';
import { rational } from '~/models/rational';
import { Step } from '~/models/step';
import { ItemId, Mocks, RecipeId } from '~/tests';
import { RateUtility } from '~/utilities/rate.utility';
import { RecipeUtility } from '~/utilities/recipe.utility';
import { SimplexUtility } from '~/utilities/simplex.utility';

import { initialItemsState } from '../items/items.reducer';
import { initialRecipesState } from '../recipes/recipes.reducer';
import {
  objectivesState,
  selectBaseObjectives,
  selectEffectivePowerUnit,
  selectEntities,
  selectIds,
  selectMatrixResult,
  selectNormalizedObjectives,
  selectObjectives,
  selectRecipesModified,
  selectStepById,
  selectStepByItemEntities,
  selectStepDetails,
  selectSteps,
  selectStepsModified,
  selectStepTree,
  selectTotals,
  selectZipState,
} from './objectives.selectors';

describe('Objectives Selectors', () => {
  describe('Base selector functions', () => {
    it('should get slices of state', () => {
      expect(
        objectivesState({
          objectivesState: Mocks.objectivesState,
        } as any),
      ).toEqual(Mocks.objectivesState);
      expect(selectIds.projector(Mocks.objectivesState)).toEqual(
        Mocks.objectivesState.ids,
      );
      expect(selectEntities.projector(Mocks.objectivesState)).toEqual(
        Mocks.objectivesState.entities,
      );
    });
  });

  describe('selectBaseObjectives', () => {
    it('should return the array of objectives', () => {
      const result = selectBaseObjectives.projector(
        Mocks.objectivesState.ids,
        Mocks.objectivesState.entities,
        Mocks.adjustedDataset,
      );
      expect(result).toEqual(Mocks.objectivesList);
    });
  });

  describe('selectObjectives', () => {
    it('should adjust recipe objectives based on settings', () => {
      spyOn(RecipeUtility, 'adjustObjective');
      selectObjectives.projector(
        [Mocks.objective5],
        Mocks.itemsStateInitial,
        Mocks.recipesStateInitial,
        Mocks.machinesStateInitial,
        Mocks.settingsStateInitial,
        Mocks.adjustedDataset,
      );
      expect(RecipeUtility.adjustObjective).toHaveBeenCalledWith(
        Mocks.objective5,
        Mocks.itemsStateInitial,
        Mocks.recipesStateInitial,
        Mocks.machinesStateInitial,
        Mocks.settingsStateInitial,
        Mocks.adjustedDataset,
      );
    });
  });

  describe('selectNormalizedObjectives', () => {
    it('should map objectives to rates', () => {
      spyOn(RateUtility, 'objectiveNormalizedRate');
      selectNormalizedObjectives.projector(
        Mocks.objectives,
        Mocks.itemsStateInitial,
        Mocks.beltSpeed,
        displayRateInfo[DisplayRate.PerMinute],
        Mocks.adjustedDataset,
      );
      expect(RateUtility.objectiveNormalizedRate).toHaveBeenCalledTimes(
        Mocks.objectives.length,
      );
    });
  });

  describe('selectMatrixResult', () => {
    it('should calculate rates using utility method', () => {
      spyOn(SimplexUtility, 'solve').and.returnValue({
        steps: [],
        resultType: SimplexResultType.Skipped,
      });
      selectMatrixResult.projector(
        Mocks.objectives,
        Mocks.settingsStateInitial,
        Mocks.adjustedDataset,
        false,
      );
      expect(SimplexUtility.solve).toHaveBeenCalled();
    });
  });

  describe('selectSteps', () => {
    it('should calculate rates using utility method', () => {
      spyOn(RateUtility, 'normalizeSteps');
      selectSteps.projector(
        Mocks.matrixResultSolved,
        [],
        {},
        {},

        {},
        displayRateInfo[DisplayRate.PerMinute],
        Mocks.settingsStateInitial,
        Mocks.adjustedDataset,
      );
      expect(RateUtility.normalizeSteps).toHaveBeenCalled();
    });
  });

  describe('selectZipState', () => {
    it('should put together the required state parts', () => {
      const objectives = Mocks.objectivesState;
      const itemsState = Mocks.itemsState;
      const recipesState = Mocks.recipesState;
      const machinesState = Mocks.machinesStateInitial;
      const settings = Mocks.settingsStateInitial;
      const data = Mocks.dataset;
      const hash = Mocks.modHash;
      const result = selectZipState.projector(
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
      const result = selectStepsModified.projector(
        Mocks.steps,
        Mocks.objectivesList,
        initialItemsState,
        initialRecipesState,
      );
      expect(result.items[Mocks.step1.itemId!]).toBeFalse();
      expect(result.recipes[Mocks.step1.recipeId!]).toBeFalse();
    });
  });

  describe('selectTotals', () => {
    it('should get totals for columns', () => {
      const result = selectTotals.projector(
        [
          {
            id: '0',
            itemId: ItemId.Coal,
            recipeId: RecipeId.Coal,
            recipe: Mocks.adjustedDataset.adjustedRecipe[RecipeId.Coal],
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
            recipe: Mocks.adjustedDataset.adjustedRecipe[RecipeId.Coal],
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
        Mocks.itemsStateInitial,
        Mocks.adjustedDataset,
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
      const result = selectTotals.projector(
        [
          {
            id: '01',
            recipeId: RecipeId.Coal,
            recipe: Mocks.adjustedDataset.adjustedRecipe[RecipeId.Coal],
            machines: rational.one,
            recipeSettings: {
              machineId: ItemId.MiningMachine,
            },
          },
        ],
        Mocks.itemsStateInitial,
        { ...Mocks.adjustedDataset, ...{ game: Game.DysonSphereProgram } },
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
      const result = selectStepDetails.projector(
        steps,
        Mocks.settingsStateInitial,
        Mocks.adjustedDataset,
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
      const result = selectStepById.projector(Mocks.steps);
      expect(Object.keys(result).length).toEqual(Mocks.steps.length);
    });
  });

  describe('selectStepByItemEntities', () => {
    it('should create a map of item ids to steps', () => {
      const result = selectStepByItemEntities.projector(Mocks.steps);
      expect(Object.keys(result).length).toEqual(Mocks.steps.length);
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
      const result = selectStepTree.projector(steps);
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
      expect(selectEffectivePowerUnit.projector([], PowerUnit.Auto)).toEqual(
        PowerUnit.kW,
      );
      expect(
        selectEffectivePowerUnit.projector(
          [{ id: '0', power: rational(1000n) }],
          PowerUnit.Auto,
        ),
      ).toEqual(PowerUnit.MW);
      expect(
        selectEffectivePowerUnit.projector(
          [
            { id: '0', power: rational(1000000n) },
            { id: '1', power: rational(1000000n) },
          ],
          PowerUnit.Auto,
        ),
      ).toEqual(PowerUnit.GW);
    });

    it('should override with specified power unit', () => {
      expect(selectEffectivePowerUnit.projector([], PowerUnit.GW)).toEqual(
        PowerUnit.GW,
      );
    });
  });

  describe('selectRecipesModified', () => {
    it('should determine whether columns are modified', () => {
      const result = selectRecipesModified.projector(
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
      const result = selectRecipesModified.projector(
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

import { TestBed } from '@angular/core/testing';

import { spread } from '~/helpers';
import { DisplayRate } from '~/models/enum/display-rate';
import { ObjectiveType } from '~/models/enum/objective-type';
import { ObjectiveUnit } from '~/models/enum/objective-unit';
import { PowerUnit } from '~/models/enum/power-unit';
import { SimplexResultType } from '~/models/enum/simplex-result-type';
import { StepDetailTab } from '~/models/enum/step-detail-tab';
import { ObjectiveState } from '~/models/objective';
import { rational } from '~/models/rational';
import { Step } from '~/models/step';
import { ItemId, Mocks, RecipeId, TestModule } from '~/tests';

import { ObjectivesStore } from './objectives.store';

describe('ObjectivesStore', () => {
  let store: ObjectivesStore;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestModule] });
    store = TestBed.inject(ObjectivesStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  describe('baseObjectives', () => {
    it('should return the array of objectives', () => {
      spyOn(store, 'state').and.returnValue(Mocks.objectivesState);
      spyOn(store.settingsStr, 'dataset').and.returnValue(
        Mocks.adjustedDataset,
      );
      const result = store.baseObjectives();
      expect(result).toEqual(Mocks.objectivesList);
    });
  });

  describe('objectives', () => {
    it('should adjust recipe objectives based on settings', () => {
      spyOn(store.recipeSvc, 'adjustObjective');
      spyOn(store, 'baseObjectives').and.returnValue([Mocks.objective5]);
      store.objectives();
      expect(store.recipeSvc.adjustObjective).toHaveBeenCalledTimes(1);
    });
  });

  describe('normalizedObjectives', () => {
    it('should map objectives to rates', () => {
      spyOn(store.rateSvc, 'objectiveNormalizedRate');
      spyOn(store, 'objectives').and.returnValue(Mocks.objectives);
      store.normalizedObjectives();
      expect(store.rateSvc.objectiveNormalizedRate).toHaveBeenCalledTimes(
        Mocks.objectives.length,
      );
    });
  });

  describe('matrixResult', () => {
    it('should calculate using utility method', () => {
      spyOn(store.simplexSvc, 'solve').and.returnValue({
        steps: [],
        resultType: SimplexResultType.Skipped,
      });
      store.matrixResult();
      expect(store.simplexSvc.solve).toHaveBeenCalled();
    });
  });

  describe('steps', () => {
    it('should normalize steps after solution is found', () => {
      spyOn(store.rateSvc, 'normalizeSteps');
      store.steps();
      expect(store.rateSvc.normalizeSteps).toHaveBeenCalled();
    });
  });

  describe('stepsModified', () => {
    it('should determine which steps have modified item or recipe settings', () => {
      spyOn(store, 'steps').and.returnValue(Mocks.steps);
      spyOn(store, 'baseObjectives').and.returnValue(Mocks.objectives);
      const result = store.stepsModified();
      expect(result.items[Mocks.step1.itemId!]).toBeFalse();
      expect(result.recipes[Mocks.step1.recipeId!]).toBeFalse();
    });
  });

  describe('totals', () => {
    it('should get totals for columns', () => {
      spyOn(store, 'steps').and.returnValue([
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
      ]);
      const result = store.totals();
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
      spyOn(store, 'steps').and.returnValue([
        {
          id: '01',
          recipeId: RecipeId.Coal,
          recipe: Mocks.adjustedDataset.adjustedRecipe[RecipeId.Coal],
          machines: rational.one,
          recipeSettings: {
            machineId: ItemId.MiningMachine,
          },
        },
      ]);
      spyOn(store.recipesStr, 'adjustedDataset').and.returnValue(
        spread(Mocks.adjustedDataset, {
          machineEntities: spread(Mocks.adjustedDataset.machineEntities, {
            [ItemId.MiningMachine]: { totalRecipe: true },
          }),
        }),
      );
      const result = store.totals();
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

  describe('stepDetails', () => {
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
      spyOn(store, 'steps').and.returnValue(steps);
      const result = store.stepDetails();
      const recipeIds = [
        RecipeId.BasicOilProcessing,
        RecipeId.AdvancedOilProcessing,
        RecipeId.CoalLiquefaction,
        RecipeId.CoalLiquefactionSteam500,
        RecipeId.LightOilCracking,
      ];
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
          recipeIds,
          recipesEnabled: recipeIds,
          recipeOptions: recipeIds.map((r) => ({
            value: r,
            label: Mocks.dataset.recipeEntities[r].name,
          })),
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
          recipeIds: [RecipeId.CrudeOil],
          recipesEnabled: [RecipeId.CrudeOil],
          recipeOptions: [
            {
              label: Mocks.dataset.recipeEntities[RecipeId.CrudeOil].name,
              value: RecipeId.CrudeOil,
            },
          ],
        },
        ['2']: {
          tabs: [],
          outputs: [],
          recipeIds: [],
          recipesEnabled: [],
          recipeOptions: [],
        },
      });
    });
  });

  describe('stepById', () => {
    it('should create a map of step ids to steps', () => {
      spyOn(store, 'steps').and.returnValue(Mocks.steps);
      const result = store.stepById();
      expect(Object.keys(result).length).toEqual(Mocks.steps.length);
    });
  });

  describe('stepByItemEntities', () => {
    it('should create a map of item ids to steps', () => {
      spyOn(store, 'steps').and.returnValue(Mocks.steps);
      const result = store.stepByItemEntities();
      expect(Object.keys(result).length).toEqual(Mocks.steps.length);
    });
  });

  describe('stepTree', () => {
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
      spyOn(store, 'steps').and.returnValue(steps);
      const result = store.stepTree();
      expect(result).toEqual({
        ['0']: [],
        ['1']: [true],
        ['2']: [true, true],
        ['3']: [true, false],
        ['4']: [false],
      });
    });
  });

  describe('effectivePowerUnit', () => {
    it('should calculate an auto power unit as kW', () => {
      spyOn(store.preferencesStr, 'powerUnit').and.returnValue(PowerUnit.Auto);
      expect(store.effectivePowerUnit()).toEqual(PowerUnit.kW);
    });

    it('should calculate auto power unit as MW', () => {
      spyOn(store, 'steps').and.returnValue([
        { id: '0', power: rational(1000n) },
      ]);
      spyOn(store.preferencesStr, 'powerUnit').and.returnValue(PowerUnit.Auto);
      expect(store.effectivePowerUnit()).toEqual(PowerUnit.MW);
    });

    it('should calculate auto power unit as GW', () => {
      spyOn(store, 'steps').and.returnValue([
        { id: '0', power: rational(1000000n) },
        { id: '1', power: rational(1000000n) },
      ]);
      spyOn(store.preferencesStr, 'powerUnit').and.returnValue(PowerUnit.Auto);
      expect(store.effectivePowerUnit()).toEqual(PowerUnit.GW);
    });

    it('should override with specified power unit', () => {
      spyOn(store.preferencesStr, 'powerUnit').and.returnValue(PowerUnit.GW);
      expect(store.effectivePowerUnit()).toEqual(PowerUnit.GW);
    });
  });

  describe('recipesModified', () => {
    it('should determine whether columns are modified', () => {
      spyOn(store.recipesStr, 'state').and.returnValue({
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
      });
      const result = store.recipesModified();
      expect(result.machines).toBeTrue();
      expect(result.beacons).toBeTrue();
      expect(result.cost).toBeFalse();
    });

    it('should account for recipe objective settings', () => {
      const objective: ObjectiveState = {
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
      spyOn(store, 'baseObjectives').and.returnValue([objective]);
      spyOn(store.recipesStr, 'state').and.returnValue({
        [RecipeId.Coal]: {},
      });
      const result = store.recipesModified();
      expect(result.machines).toBeTrue();
      expect(result.beacons).toBeTrue();
      expect(result.cost).toBeFalse();
    });
  });

  describe('effects', () => {
    it('should automatically trigger adjustDisplayRate', () => {
      store.settingsStr.load$.next();
      spyOn(store, 'adjustDisplayRate');
      TestBed.flushEffects();
      store.settingsStr.apply({ displayRate: DisplayRate.PerHour });
      TestBed.flushEffects();
      expect(store.adjustDisplayRate).toHaveBeenCalledWith(rational(60n));
    });
  });

  describe('add', () => {
    it('should add the objective', () => {
      store.add({ targetId: ItemId.Coal, unit: ObjectiveUnit.Items });
      expect(store.state()).toEqual({
        ['1']: {
          id: '1',
          targetId: ItemId.Coal,
          value: rational.one,
          unit: ObjectiveUnit.Items,
          type: ObjectiveType.Output,
        },
      });
    });

    it('should use the last value', () => {
      store.create({
        targetId: ItemId.Coal,
        value: rational(60n),
        unit: ObjectiveUnit.Items,
        type: ObjectiveType.Output,
      });
      store.add({ targetId: ItemId.Coal, unit: ObjectiveUnit.Items });
      expect(store.state()['1'].value).toEqual(rational(60n));
    });
  });

  describe('remove', () => {
    it('should remove an objective and re-sort remaining objectives', () => {
      store.create({
        targetId: ItemId.Coal,
        value: rational.one,
        unit: ObjectiveUnit.Items,
        type: ObjectiveType.Output,
      });
      store.add({ targetId: ItemId.Coal, unit: ObjectiveUnit.Items });
      store.add({ targetId: ItemId.Coal, unit: ObjectiveUnit.Items });
      store.remove('2');
      expect(store.state()).toEqual({
        ['1']: {
          id: '1',
          targetId: ItemId.Coal,
          value: rational.one,
          unit: ObjectiveUnit.Items,
          type: ObjectiveType.Output,
        },
        ['2']: {
          id: '2',
          targetId: ItemId.Coal,
          value: rational.one,
          unit: ObjectiveUnit.Items,
          type: ObjectiveType.Output,
        },
      });
    });
  });

  describe('setOrder', () => {
    it('should map objectives to an ids array', () => {
      store.setOrder(Mocks.objectives);
      expect(Object.keys(store.state())).toEqual(
        Mocks.objectives.map((o) => o.id),
      );
    });
  });

  describe('adjustDisplayRate', () => {
    it('should adjust display rates', () => {
      store.load(Mocks.objectivesState);
      store.adjustDisplayRate(rational(2n));
      const result = store.state();
      expect(result['1'].value).toEqual(rational(2n));
      expect(result['3'].value).toEqual(rational.one);
    });
  });
});

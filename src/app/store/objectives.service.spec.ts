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

import { ObjectivesService } from './objectives.service';

describe('ObjectivesService', () => {
  let service: ObjectivesService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestModule] });
    service = TestBed.inject(ObjectivesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('baseObjectives', () => {
    it('should return the array of objectives', () => {
      spyOn(service, 'state').and.returnValue(Mocks.objectivesState);
      spyOn(service.settingsSvc, 'dataset').and.returnValue(
        Mocks.adjustedDataset,
      );
      const result = service.baseObjectives();
      expect(result).toEqual(Mocks.objectivesList);
    });
  });

  describe('objectives', () => {
    it('should adjust recipe objectives based on settings', () => {
      spyOn(service.recipeSvc, 'adjustObjective');
      spyOn(service, 'baseObjectives').and.returnValue([Mocks.objective5]);
      service.objectives();
      expect(service.recipeSvc.adjustObjective).toHaveBeenCalledTimes(1);
    });
  });

  describe('normalizedObjectives', () => {
    it('should map objectives to rates', () => {
      spyOn(service.rateSvc, 'objectiveNormalizedRate');
      spyOn(service, 'objectives').and.returnValue(Mocks.objectives);
      service.normalizedObjectives();
      expect(service.rateSvc.objectiveNormalizedRate).toHaveBeenCalledTimes(
        Mocks.objectives.length,
      );
    });
  });

  describe('matrixResult', () => {
    it('should calculate using utility method', () => {
      spyOn(service.simplexSvc, 'solve').and.returnValue({
        steps: [],
        resultType: SimplexResultType.Skipped,
      });
      service.matrixResult();
      expect(service.simplexSvc.solve).toHaveBeenCalled();
    });
  });

  describe('steps', () => {
    it('should normalize steps after solution is found', () => {
      spyOn(service.rateSvc, 'normalizeSteps');
      service.steps();
      expect(service.rateSvc.normalizeSteps).toHaveBeenCalled();
    });
  });

  describe('stepsModified', () => {
    it('should determine which steps have modified item or recipe settings', () => {
      spyOn(service, 'steps').and.returnValue(Mocks.steps);
      spyOn(service, 'baseObjectives').and.returnValue(Mocks.objectives);
      const result = service.stepsModified();
      expect(result.items[Mocks.step1.itemId!]).toBeFalse();
      expect(result.recipes[Mocks.step1.recipeId!]).toBeFalse();
    });
  });

  describe('totals', () => {
    it('should get totals for columns', () => {
      spyOn(service, 'steps').and.returnValue([
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
      const result = service.totals();
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
      spyOn(service, 'steps').and.returnValue([
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
      spyOn(service.recipesSvc, 'adjustedDataset').and.returnValue(
        spread(Mocks.adjustedDataset, {
          machineEntities: spread(Mocks.adjustedDataset.machineEntities, {
            [ItemId.MiningMachine]: { totalRecipe: true },
          }),
        }),
      );
      const result = service.totals();
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
      spyOn(service, 'steps').and.returnValue(steps);
      const result = service.stepDetails();
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
      spyOn(service, 'steps').and.returnValue(Mocks.steps);
      const result = service.stepById();
      expect(Object.keys(result).length).toEqual(Mocks.steps.length);
    });
  });

  describe('stepByItemEntities', () => {
    it('should create a map of item ids to steps', () => {
      spyOn(service, 'steps').and.returnValue(Mocks.steps);
      const result = service.stepByItemEntities();
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
      spyOn(service, 'steps').and.returnValue(steps);
      const result = service.stepTree();
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
      spyOn(service.preferencesSvc, 'powerUnit').and.returnValue(
        PowerUnit.Auto,
      );
      expect(service.effectivePowerUnit()).toEqual(PowerUnit.kW);
    });

    it('should calculate auto power unit as MW', () => {
      spyOn(service, 'steps').and.returnValue([
        { id: '0', power: rational(1000n) },
      ]);
      spyOn(service.preferencesSvc, 'powerUnit').and.returnValue(
        PowerUnit.Auto,
      );
      expect(service.effectivePowerUnit()).toEqual(PowerUnit.MW);
    });

    it('should calculate auto power unit as GW', () => {
      spyOn(service, 'steps').and.returnValue([
        { id: '0', power: rational(1000000n) },
        { id: '1', power: rational(1000000n) },
      ]);
      spyOn(service.preferencesSvc, 'powerUnit').and.returnValue(
        PowerUnit.Auto,
      );
      expect(service.effectivePowerUnit()).toEqual(PowerUnit.GW);
    });

    it('should override with specified power unit', () => {
      spyOn(service.preferencesSvc, 'powerUnit').and.returnValue(PowerUnit.GW);
      expect(service.effectivePowerUnit()).toEqual(PowerUnit.GW);
    });
  });

  describe('recipesModified', () => {
    it('should determine whether columns are modified', () => {
      spyOn(service.recipesSvc, 'state').and.returnValue({
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
      const result = service.recipesModified();
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
      spyOn(service, 'baseObjectives').and.returnValue([objective]);
      spyOn(service.recipesSvc, 'state').and.returnValue({
        [RecipeId.Coal]: {},
      });
      const result = service.recipesModified();
      expect(result.machines).toBeTrue();
      expect(result.beacons).toBeTrue();
      expect(result.cost).toBeFalse();
    });
  });

  describe('effects', () => {
    it('should automatically trigger adjustDisplayRate', () => {
      service.settingsSvc.load$.next();
      spyOn(service, 'adjustDisplayRate');
      TestBed.flushEffects();
      service.settingsSvc.apply({ displayRate: DisplayRate.PerHour });
      TestBed.flushEffects();
      expect(service.adjustDisplayRate).toHaveBeenCalledWith(rational(60n));
    });
  });

  describe('add', () => {
    it('should add the objective', () => {
      service.add({ targetId: ItemId.Coal, unit: ObjectiveUnit.Items });
      expect(service.state()).toEqual({
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
      service.create({
        targetId: ItemId.Coal,
        value: rational(60n),
        unit: ObjectiveUnit.Items,
        type: ObjectiveType.Output,
      });
      service.add({ targetId: ItemId.Coal, unit: ObjectiveUnit.Items });
      expect(service.state()['1'].value).toEqual(rational(60n));
    });
  });

  describe('remove', () => {
    it('should remove an objective and re-sort remaining objectives', () => {
      service.create({
        targetId: ItemId.Coal,
        value: rational.one,
        unit: ObjectiveUnit.Items,
        type: ObjectiveType.Output,
      });
      service.add({ targetId: ItemId.Coal, unit: ObjectiveUnit.Items });
      service.add({ targetId: ItemId.Coal, unit: ObjectiveUnit.Items });
      service.remove('2');
      expect(service.state()).toEqual({
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
      service.setOrder(Mocks.objectives);
      expect(Object.keys(service.state())).toEqual(
        Mocks.objectives.map((o) => o.id),
      );
    });
  });

  describe('adjustDisplayRate', () => {
    it('should adjust display rates', () => {
      service.load(Mocks.objectivesState);
      service.adjustDisplayRate(rational(2n));
      const result = service.state();
      expect(result['1'].value).toEqual(rational(2n));
      expect(result['3'].value).toEqual(rational.one);
    });
  });
});

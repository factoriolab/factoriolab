import { TestBed } from '@angular/core/testing';

import { rational } from '~/rational/rational';
import { Step } from '~/solver/step';
import { ItemId } from '~/tests/item-id';
import { Mocks } from '~/tests/mocks/mocks';
import {
  mockObjective3,
  mockObjective5,
  mockObjectiveBase,
  mockObjectivesList,
  mockObjectivesState,
} from '~/tests/mocks/objective';
import { RecipeId } from '~/tests/recipe-id';
import { TestModule } from '~/tests/test-module';

import { PowerUnit } from '../preferences/power-unit';
import { DisplayRate } from '../settings/display-rate';
import { ObjectiveState } from './objective';
import { ObjectiveType } from './objective-type';
import { ObjectiveUnit } from './objective-unit';
import { ObjectivesStore } from './objectives-store';

describe('ObjectivesStore', () => {
  let service: ObjectivesStore;
  let mocks: Mocks;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestModule] });
    service = TestBed.inject(ObjectivesStore);
    mocks = TestBed.inject(Mocks);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  describe('baseObjectives', () => {
    it('should return the array of objectives', () => {
      spyOn(service, 'state').and.returnValue(mockObjectivesState);
      const result = service.baseObjectives();
      expect(result).toEqual(mockObjectivesList);
    });
  });

  describe('objectives', () => {
    it('should adjust recipe objectives based on settings', () => {
      spyOn(service['adjustment'], 'adjustObjective');
      spyOn(service, 'baseObjectives').and.returnValue([mockObjective5]);
      service.objectives();
      expect(service['adjustment'].adjustObjective).toHaveBeenCalledTimes(1);
    });
  });

  describe('normalizedObjectives', () => {
    it('should map objectives to rates', () => {
      spyOn(service['normalization'], 'normalizeRate');
      spyOn(service, 'objectives').and.returnValue(mocks.objectives());
      service.normalizedObjectives();
      expect(service['normalization'].normalizeRate).toHaveBeenCalledTimes(
        mocks.objectives().length,
      );
    });
  });

  describe('matrixResult', () => {
    it('should calculate using utility method', () => {
      spyOn(service['solver'], 'solve').and.returnValue({
        steps: [],
        resultType: 'skipped',
      });
      service.matrixResult();
      expect(service['solver'].solve).toHaveBeenCalled();
    });
  });

  describe('steps', () => {
    it('should normalize steps after solution is found', () => {
      spyOn(service['normalization'], 'normalizeSteps');
      service.steps();
      expect(service['normalization'].normalizeSteps).toHaveBeenCalled();
    });
  });

  describe('stepsModified', () => {
    it('should determine which steps have modified item or recipe settings', () => {
      spyOn(service, 'steps').and.returnValue(mocks.steps());
      spyOn(service, 'baseObjectives').and.returnValue(mocks.objectives());
      const result = service.stepsModified();
      expect(result.items[mocks.step1().itemId!]).toBeFalse();
      expect(result.recipes[mocks.step1().recipeId!]).toBeFalse();
    });
  });

  describe('totals', () => {
    it('should get totals for columns', () => {
      spyOn(service, 'steps').and.returnValue([
        {
          id: '0',
          itemId: ItemId.Coal,
          recipeId: RecipeId.Coal,
          recipe:
            service['recipesStore'].adjustedDataset().adjustedRecipe[
              RecipeId.Coal
            ],
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
                modules: [{ count: rational(2n), id: '' }],
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
          rockets: rational.one,
          recipe:
            service['recipesStore'].adjustedDataset().adjustedRecipe[
              RecipeId.Coal
            ],
          recipeSettings: {
            machineId: ItemId.ElectricMiningDrill,
            modules: [
              { count: rational.one, id: '' },
              { count: rational(2n), id: ItemId.SpeedModule3 },
            ],
            beacons: [
              {
                count: rational(2n),
                id: ItemId.Beacon,
                modules: [
                  { count: rational.one, id: ItemId.SpeedModule3 },
                  { count: rational.one, id: '' },
                ],
                total: rational.one,
              },
            ],
          },
        },
      ]);
      const result = service.totals();
      expect(result).toEqual({
        belts: {
          [ItemId.ExpressTransportBelt]: {
            total: rational.one,
            iconType: 'item',
            tooltipType: 'belt',
          },
        },
        wagons: {
          [ItemId.CargoWagon]: {
            total: rational.one,
            iconType: 'item',
            tooltipType: 'wagon',
          },
        },
        machines: {
          [ItemId.ElectricMiningDrill]: {
            total: rational.one,
            iconType: 'item',
            tooltipType: 'machine',
          },
          [ItemId.SpeedModule3]: {
            total: rational(2n),
            iconType: 'item',
            tooltipType: 'module',
          },
        },
        beacons: {
          [ItemId.Beacon]: {
            total: rational.one,
            iconType: 'item',
            tooltipType: 'beacon',
          },
          [ItemId.SpeedModule3]: {
            total: rational.one,
            iconType: 'item',
            tooltipType: 'module',
          },
        },
        rockets: rational.one,
        power: rational.one,
        pollution: rational.one,
      });
    });

    it('should calculate dsp mining total by recipe', () => {
      const data = mocks.getAdjustedDataset();
      spyOn(service, 'steps').and.returnValue([
        {
          id: '01',
          recipeId: RecipeId.Coal,
          recipe: data.adjustedRecipe[RecipeId.Coal],
          machines: rational.one,
          recipeSettings: {
            machineId: ItemId.ElectricMiningDrill,
          },
        },
      ]);
      data.machineRecord[ItemId.ElectricMiningDrill].totalRecipe = true;
      spyOn(service['recipesStore'], 'adjustedDataset').and.returnValue(data);
      const result = service.totals();
      expect(result).toEqual({
        belts: {},
        wagons: {},
        machines: {
          [RecipeId.Coal]: {
            total: rational.one,
            iconType: 'recipe',
            tooltipType: 'recipe',
          },
        },
        beacons: {},
        rockets: rational.zero,
        power: rational.zero,
        pollution: rational.zero,
      });
    });
  });

  describe('itemSourceMap', () => {
    it('should generate a map of item sources', () => {
      const step1: Step = {
        id: '0',
        itemId: ItemId.ElectronicCircuit,
        outputs: { [ItemId.ElectronicCircuit]: rational(1n, 2n) },
      };
      spyOn(service, 'steps').and.returnValue([
        step1,
        { id: '1', itemId: ItemId.IronOre },
      ]);
      const result = service.itemSourceMap();
      expect(result).toEqual({
        [ItemId.ElectronicCircuit]: [
          { value: rational(1n, 2n), step: step1 },
          { isInput: true, value: rational(1n, 2n) },
        ],
        [ItemId.IronOre]: [{ isInput: true, value: rational.one }],
      });
    });
  });

  describe('stepDetails', () => {
    it('should collect information for various step detail sections', () => {
      const data = mocks.getAdjustedDataset();
      const recipe = data.adjustedRecipe[RecipeId.ElectronicCircuit];
      recipe.flags.add('mining');
      recipe.in[ItemId.ElectronicCircuit] = rational(1n, 100n);
      recipe.out[ItemId.IronOre] = rational.zero;
      const steps: Step[] = [
        {
          id: '0',
          itemId: ItemId.ElectronicCircuit,
          items: rational.one,
          recipeId: RecipeId.ElectronicCircuit,
          parents: {
            '0': rational.one,
          },
          recipe,
          outputs: {
            [ItemId.ElectronicCircuit]: rational.one,
            [ItemId.IronOre]: rational.zero,
          },
        },
      ];
      spyOn(service, 'steps').and.returnValue(steps);
      spyOn(service, 'itemSourceMap').and.returnValue({
        [ItemId.ElectronicCircuit]: [
          { step: { id: '1' }, value: rational.one },
        ],
      });
      const result = service.stepDetails();
      expect(result).toEqual({
        '0': {
          destinations: [
            {
              items: rational.one,
              itemId: ItemId.ElectronicCircuit,
              belts: undefined,
              beltId: ItemId.ExpressTransportBelt,
              stack: rational.one,
              wagons: undefined,
              wagonId: ItemId.CargoWagon,
              recipeId: RecipeId.ElectronicCircuit,
              recipeObjectiveId: undefined,
              percent: rational.one,
              destId: RecipeId.ElectronicCircuit,
              destType: 'recipe',
              isOutput: false,
              machines: undefined,
              machineId: undefined,
            },
          ],
          sources: [
            {
              items: rational.one,
              itemId: ItemId.ElectronicCircuit,
              belts: undefined,
              beltId: ItemId.ExpressTransportBelt,
              stack: rational.one,
              wagons: undefined,
              wagonId: ItemId.CargoWagon,
              machines: undefined,
              machineId: undefined,
              recipeId: undefined,
              recipeObjectiveId: undefined,
              percent: rational.one,
              percentOnDest: true,
              destId: ItemId.ElectronicCircuit,
              destType: 'item',
              isInput: undefined,
            },
          ],
          depletion: [
            {
              items: rational(5n, 7n),
              itemId: ItemId.ElectronicCircuit,
            },
          ],
          inputs: [
            {
              items: rational.one,
              itemId: ItemId.ElectronicCircuit,
              belts: undefined,
              beltId: ItemId.ExpressTransportBelt,
              stack: rational.one,
              wagons: undefined,
              wagonId: ItemId.CargoWagon,
              machines: undefined,
              machineId: undefined,
              recipeId: undefined,
              recipeObjectiveId: undefined,
              percent: rational.one,
              destId: RecipeId.ElectronicCircuit,
              destRecipeObjectiveId: undefined,
              destType: 'recipe',
            },
          ],
          outputs: [
            {
              items: rational.one,
              itemId: ItemId.ElectronicCircuit,
              belts: undefined,
              beltId: ItemId.ExpressTransportBelt,
              stack: rational.one,
              wagons: undefined,
              wagonId: ItemId.CargoWagon,
              machines: undefined,
              machineId: undefined,
              recipeId: RecipeId.ElectronicCircuit,
              recipeObjectiveId: undefined,
              percent: rational.one,
              percentOnDest: true,
              destId: ItemId.ElectronicCircuit,
              destType: 'item',
              destRecipeObjectiveId: undefined,
            },
          ],
        },
      });
    });
  });

  describe('stepRecipes', () => {
    it('should collect recipes relevant to each step', () => {
      const steps: Step[] = [
        { id: '0', itemId: ItemId.ElectronicCircuit },
        { id: '1', recipeId: ItemId.ElectronicCircuit },
      ];
      spyOn(service, 'steps').and.returnValue(steps);
      const result = service.stepRecipes();
      expect(result).toEqual({
        '0': {
          ids: [RecipeId.ElectronicCircuit],
          enabledIds: [RecipeId.ElectronicCircuit],
          options: [
            {
              label: 'Electronic circuit',
              value: RecipeId.ElectronicCircuit,
              icon: RecipeId.ElectronicCircuit,
              iconType: 'recipe',
              tooltip: RecipeId.ElectronicCircuit,
              tooltipType: 'recipe',
            },
          ],
        },
        '1': {
          ids: [RecipeId.ElectronicCircuit],
          enabledIds: [RecipeId.ElectronicCircuit],
          options: [
            {
              label: 'Electronic circuit',
              value: RecipeId.ElectronicCircuit,
              icon: RecipeId.ElectronicCircuit,
              iconType: 'recipe',
              tooltip: RecipeId.ElectronicCircuit,
              tooltipType: 'recipe',
            },
          ],
        },
      });
    });
  });

  describe('stepById', () => {
    it('should create a map of step ids to steps', () => {
      spyOn(service, 'steps').and.returnValue(mocks.steps());
      const result = service.stepById();
      expect(Object.keys(result).length).toEqual(mocks.steps().length);
    });
  });

  describe('stepByItemRecord', () => {
    it('should create a map of item ids to steps', () => {
      spyOn(service, 'steps').and.returnValue(mocks.steps());
      const result = service.stepByItemRecord();
      expect(Object.keys(result).length).toEqual(mocks.steps().length);
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
      spyOn(service['preferencesStore'], 'powerUnit').and.returnValue(
        PowerUnit.Auto,
      );
      expect(service.effectivePowerUnit()).toEqual(PowerUnit.kW);
    });

    it('should calculate auto power unit as MW', () => {
      spyOn(service, 'steps').and.returnValue([
        { id: '0', power: rational(1000n) },
      ]);
      spyOn(service['preferencesStore'], 'powerUnit').and.returnValue(
        PowerUnit.Auto,
      );
      expect(service.effectivePowerUnit()).toEqual(PowerUnit.MW);
    });

    it('should calculate auto power unit as GW', () => {
      spyOn(service, 'steps').and.returnValue([
        { id: '0', power: rational(1000000n) },
        { id: '1', power: rational(1000000n) },
      ]);
      spyOn(service['preferencesStore'], 'powerUnit').and.returnValue(
        PowerUnit.Auto,
      );
      expect(service.effectivePowerUnit()).toEqual(PowerUnit.GW);
    });

    it('should override with specified power unit', () => {
      spyOn(service['preferencesStore'], 'powerUnit').and.returnValue(
        PowerUnit.GW,
      );
      expect(service.effectivePowerUnit()).toEqual(PowerUnit.GW);
    });
  });

  describe('recipesModified', () => {
    it('should determine whether columns are modified', () => {
      spyOn(service['recipesStore'], 'state').and.returnValue({
        [RecipeId.Coal]: {
          machineId: undefined,
          modules: undefined,
          overclock: rational(100n),
          beacons: [
            {
              count: rational.one,
              id: ItemId.Beacon,
              modules: [{ count: rational(2n), id: '' }],
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
            modules: [{ count: rational(2n), id: '' }],
          },
        ],
      };
      spyOn(service, 'baseObjectives').and.returnValue([objective]);
      spyOn(service['recipesStore'], 'state').and.returnValue({
        [RecipeId.Coal]: {},
      });
      const result = service.recipesModified();
      expect(result.machines).toBeTrue();
      expect(result.beacons).toBeTrue();
      expect(result.cost).toBeFalse();
    });
  });

  describe('message', () => {
    it('should generate a message for paused', () => {
      spyOn(service, 'matrixResult').and.returnValue({
        resultType: 'paused',
      } as any);
      expect(service.message()?.detail).toEqual('objectives.pausedMessage');
    });

    it('should generate no message when successful', () => {
      spyOn(service, 'matrixResult').and.returnValue({
        resultType: 'solved',
      } as any);
      expect(service.message()).toBeUndefined();
    });

    it('should generate a default error message', () => {
      spyOn(service, 'matrixResult').and.returnValue({
        resultType: 'failed',
      } as any);
      expect(service.message()?.detail).toEqual('objectives.errorDetail');
    });

    it('should generate a message for unbounded with unboundedRecipeId', () => {
      spyOn(service, 'objectives').and.returnValue(mockObjectivesList);
      spyOn(service, 'matrixResult').and.returnValue({
        resultType: 'failed',
        simplexStatus: 'unbounded',
        unboundedRecipeId: RecipeId.ElectronicCircuit,
      } as any);
      expect(service.message()?.detail).toEqual(
        'objectives.errorSimplexUnboundedRecipe',
      );
    });

    it('should generate a message for unbounded with no limits', () => {
      spyOn(service, 'objectives').and.returnValue([mockObjective3]);
      spyOn(service, 'matrixResult').and.returnValue({
        resultType: 'failed',
        simplexStatus: 'unbounded',
      } as any);
      expect(service.message()?.detail).toEqual('objectives.errorNoLimits');
    });

    it('should generate a message for unbounded with excluded maximize item', () => {
      spyOn(service['settingsStore'], 'settings').and.returnValue({
        excludedItemIds: new Set([ItemId.PlasticBar]),
        excludedRecipeIds: new Set(),
      } as any);
      spyOn(service, 'objectives').and.returnValue(mockObjectivesList);
      spyOn(service, 'matrixResult').and.returnValue({
        resultType: 'failed',
        simplexStatus: 'unbounded',
      } as any);
      expect(service.message()?.detail).toEqual(
        'objectives.errorMaximizeExcluded',
      );
    });

    it('should generate a message for unbounded with excluded maximize recipe', () => {
      spyOn(service['settingsStore'], 'settings').and.returnValue({
        excludedItemIds: new Set(),
        excludedRecipeIds: new Set([ItemId.FirearmMagazine]),
      } as any);
      spyOn(service, 'objectives').and.returnValue(mockObjectivesList);
      spyOn(service, 'matrixResult').and.returnValue({
        resultType: 'failed',
        simplexStatus: 'unbounded',
      } as any);
      expect(service.message()?.detail).toEqual(
        'objectives.errorMaximizeExcluded',
      );
    });

    it('should generate a message for no_feasible', () => {
      spyOn(service, 'objectives').and.returnValue([mockObjective3]);
      spyOn(service, 'matrixResult').and.returnValue({
        resultType: 'failed',
        simplexStatus: 'no_feasible',
      } as any);
      expect(service.message()?.detail).toEqual(
        'objectives.errorInfeasibleDetail',
      );
    });
  });

  describe('effects', () => {
    it('should set the page title', () => {
      const spy = spyOn(service['title'], 'setTitle');
      service.add(mockObjectiveBase);
      TestBed.tick();
      expect(service['title'].setTitle).toHaveBeenCalledWith(
        'Coal | FactorioLab',
      );
      spy.calls.reset();
      service.remove('1');
      TestBed.tick();
      expect(service['title'].setTitle).toHaveBeenCalledWith('FactorioLab');
      spy.calls.reset();
      service.add({
        targetId: RecipeId.ElectronicCircuit,
        value: rational.one,
        unit: ObjectiveUnit.Machines,
        type: ObjectiveType.Output,
      });
      TestBed.tick();
      expect(service['title'].setTitle).toHaveBeenCalledWith(
        'Electronic circuit | FactorioLab',
      );
    });
  });

  describe('add', () => {
    it('should add the objective', () => {
      service.add({
        targetId: ItemId.Coal,
        value: rational.one,
        unit: ObjectiveUnit.Items,
        type: ObjectiveType.Output,
      });
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
  });

  describe('remove', () => {
    it('should remove an objective and re-sort remaining objectives', () => {
      service.create({
        targetId: ItemId.Coal,
        value: rational.one,
        unit: ObjectiveUnit.Items,
        type: ObjectiveType.Output,
      });
      service.add({
        targetId: ItemId.Coal,
        value: rational.one,
        unit: ObjectiveUnit.Items,
        type: ObjectiveType.Output,
      });
      service.add({
        targetId: ItemId.Coal,
        value: rational.one,
        unit: ObjectiveUnit.Items,
        type: ObjectiveType.Output,
      });
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
      service.setOrder(mocks.objectives());
      expect(Object.keys(service.state())).toEqual(
        mocks.objectives().map((o) => o.id),
      );
    });
  });

  describe('updateRecipeField', () => {
    it('should update the recipe field for a recipe objective', () => {
      spyOn(service, 'updateRecordField');
      spyOn(service, 'removeRecordFields');
      service.updateRecipeField(
        { id: '1', recipeObjectiveId: '1' },
        'machineId',
        ItemId.AssemblingMachine1,
      );
      expect(service.updateRecordField).toHaveBeenCalled();
      expect(service.removeRecordFields).toHaveBeenCalled();
    });

    it('should update the recipe field for a recipe', () => {
      spyOn(service['recipesStore'], 'updateRecordField');
      spyOn(service['recipesStore'], 'removeRecordFields');
      service.updateRecipeField(
        { id: '1', recipeId: RecipeId.ElectronicCircuit },
        'machineId',
        ItemId.AssemblingMachine1,
      );
      expect(service['recipesStore'].updateRecordField).toHaveBeenCalled();
      expect(service['recipesStore'].removeRecordFields).toHaveBeenCalled();
    });
  });

  describe('adjustDisplayRate', () => {
    it('should adjust display rates', () => {
      service.load(mockObjectivesState);
      service.adjustDisplayRate(DisplayRate.PerHour);
      const result = service.state();
      expect(result['1'].value).toEqual(rational(60n));
      expect(result['3'].value).toEqual(rational.one);
    });
  });
});

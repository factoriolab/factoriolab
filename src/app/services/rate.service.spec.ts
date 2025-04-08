import { TestBed } from '@angular/core/testing';

import { spread } from '~/helpers';
import { DisplayRate, displayRateInfo } from '~/models/enum/display-rate';
import { ObjectiveType } from '~/models/enum/objective-type';
import { ObjectiveUnit } from '~/models/enum/objective-unit';
import { flags } from '~/models/flags';
import { ObjectiveSettings } from '~/models/objective';
import { rational } from '~/models/rational';
import { Step } from '~/models/step';
import { Entities } from '~/models/utils';
import { ItemId, Mocks, RecipeId, TestModule } from '~/tests';

import { RateService } from './rate.service';

describe('RateService', () => {
  let service: RateService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestModule] });
    service = TestBed.inject(RateService);
  });

  describe('objectiveNormalizedRate', () => {
    it('should skip on maximize objectives', () => {
      expect(
        service.objectiveNormalizedRate(
          {
            id: '0',
            targetId: ItemId.Coal,
            value: rational.one,
            unit: ObjectiveUnit.Belts,
            type: ObjectiveType.Maximize,
          },
          Mocks.itemsStateInitial,
          Mocks.beltSpeed,
          Mocks.drInfo,
          Mocks.adjustedDataset,
        ),
      ).toEqual(rational.one);
    });

    it('should normalize item objective rates based on display rate', () => {
      expect(
        service.objectiveNormalizedRate(
          {
            id: '0',
            targetId: ItemId.Coal,
            value: rational.one,
            unit: ObjectiveUnit.Items,
            type: ObjectiveType.Output,
          },
          Mocks.itemsStateInitial,
          Mocks.beltSpeed,
          Mocks.drInfo,
          Mocks.adjustedDataset,
        ),
      ).toEqual(rational(1n, 60n));
    });

    it('should normalize item objective rates based on belts', () => {
      expect(
        service.objectiveNormalizedRate(
          {
            id: '0',
            targetId: ItemId.Coal,
            value: rational.one,
            unit: ObjectiveUnit.Belts,
            type: ObjectiveType.Output,
          },
          Mocks.itemsStateInitial,
          Mocks.beltSpeed,
          Mocks.drInfo,
          Mocks.adjustedDataset,
        ),
      ).toEqual(rational(45n));
    });

    it('should normalize item objective rates based on wagons', () => {
      expect(
        service.objectiveNormalizedRate(
          {
            id: '0',
            targetId: ItemId.Coal,
            value: rational.one,
            unit: ObjectiveUnit.Wagons,
            type: ObjectiveType.Output,
          },
          Mocks.itemsStateInitial,
          Mocks.beltSpeed,
          Mocks.drInfo,
          Mocks.adjustedDataset,
        ),
      ).toEqual(rational(100n, 3n));

      expect(
        service.objectiveNormalizedRate(
          {
            id: '0',
            targetId: ItemId.PetroleumGas,
            value: rational.one,
            unit: ObjectiveUnit.Wagons,
            type: ObjectiveType.Output,
          },
          Mocks.itemsStateInitial,
          Mocks.beltSpeed,
          Mocks.drInfo,
          Mocks.adjustedDataset,
        ),
      ).toEqual(rational(1250n, 3n));
    });

    it('should adjust technology objective rate by productivity', () => {
      expect(
        service.objectiveNormalizedRate(
          {
            id: '0',
            targetId: ItemId.ArtilleryShellRange,
            value: rational.one,
            unit: ObjectiveUnit.Items,
            type: ObjectiveType.Output,
          },
          Mocks.itemsStateInitial,
          Mocks.beltSpeed,
          Mocks.drInfo,
          Mocks.adjustedDataset,
        ),
      ).toEqual(rational(1n, 50n));
    });
  });

  describe('addEntityValue', () => {
    it('should add parents field to step', () => {
      const step = spread(Mocks.step1);
      service.addEntityValue(step, 'parents', ItemId.Coal, rational.one);
      expect(step.parents).toEqual({ [ItemId.Coal]: rational.one });
    });

    it('should add to existing parents object value', () => {
      const step = spread(Mocks.step1, {
        parents: { [ItemId.Coal]: rational.zero },
      });
      service.addEntityValue(step, 'parents', ItemId.Coal, rational.one);
      expect(step.parents).toEqual({ [ItemId.Coal]: rational.one });
    });

    it('should add a new key to an existing parents object', () => {
      const step = spread(Mocks.step1, { parents: {} });
      service.addEntityValue(step, 'parents', ItemId.Coal, rational.one);
      expect(step.parents).toEqual({ [ItemId.Coal]: rational.one });
    });
  });

  describe('adjustPowerPollution', () => {
    it('should handle no machines', () => {
      const step: any = { machines: null };
      const result = spread(step);
      service.adjustPowerPollution(
        result,
        Mocks.adjustedDataset.adjustedRecipe[RecipeId.WoodenChest],
        Mocks.dataset,
      );
      expect(result).toEqual(step);
    });

    it('should handle null drain/consumption/pollution', () => {
      const step: any = { machines: rational.one };
      const result = spread(step);
      const recipe: any = { drain: null, consumption: null, pollution: null };
      service.adjustPowerPollution(result, recipe, Mocks.dataset);
      expect(result).toEqual(step);
    });

    it('should handle only drain', () => {
      const step: any = { machines: rational.one };
      const result = spread(step);
      const recipe: any = {
        drain: rational(2n),
        consumption: null,
        pollution: null,
      };
      service.adjustPowerPollution(result, recipe, Mocks.dataset);
      expect(result).toEqual({
        machines: rational.one,
        power: rational(2n),
      });
    });

    it('should handle account for non-cumulative DSP drain', () => {
      const step: any = { machines: rational(1n, 3n) };
      const result = spread(step);
      const recipe: any = {
        drain: rational(2n),
        consumption: null,
        pollution: null,
      };
      const data = Mocks.getDataset();
      data.flags = flags.dsp;
      service.adjustPowerPollution(result, recipe, data);
      expect(result).toEqual({
        machines: rational(1n, 3n),
        power: rational(4n, 3n),
      });
    });

    it('should handle only consumption', () => {
      const step: any = { machines: rational.one };
      const result = spread(step);
      const recipe: any = {
        drain: null,
        consumption: rational(2n),
        pollution: null,
      };
      service.adjustPowerPollution(result, recipe, Mocks.dataset);
      expect(result).toEqual({
        machines: rational.one,
        power: rational(2n),
      });
    });

    it('should calculate power/pollution', () => {
      const step: any = { machines: rational(3n, 2n) };
      const recipe: any = {
        drain: rational(3n),
        consumption: rational(4n),
        pollution: rational(5n),
      };
      service.adjustPowerPollution(step, recipe, Mocks.dataset);
      expect(step).toEqual({
        machines: rational(3n, 2n),
        power: rational(12n),
        pollution: rational(15n, 2n),
      });
    });
  });

  describe('normalizeSteps', () => {
    it('should update update various step fields after solution is found', () => {
      spyOn(service, 'calculateParentsOutputs');
      spyOn(service, 'calculateSettings');
      spyOn(service, 'calculateBelts');
      spyOn(service, 'calculateBeacons');
      spyOn(service, 'calculateDisplayRate');
      spyOn(service, 'calculateHierarchy');
      service.normalizeSteps(
        [{ id: '0' }, { id: '1' }],
        [],
        {},
        {},
        {},
        displayRateInfo[DisplayRate.PerMinute],
        Mocks.settingsStateInitial,
        Mocks.adjustedDataset,
      );
      expect(service.calculateParentsOutputs).toHaveBeenCalledTimes(2);
      expect(service.calculateSettings).toHaveBeenCalledTimes(2);
      expect(service.calculateBelts).toHaveBeenCalledTimes(2);
      expect(service.calculateBeacons).toHaveBeenCalledTimes(2);
      expect(service.calculateDisplayRate).toHaveBeenCalledTimes(2);
      expect(service.calculateHierarchy).toHaveBeenCalledTimes(1);
    });
  });

  describe('calculateParentsOutputs', () => {
    it('should add parent values for relevant steps', () => {
      spyOn(service, 'addEntityValue');
      const stepA: Step = {
        id: '0',
        items: rational.one,
        itemId: ItemId.IronPlate,
        recipe: Mocks.adjustedDataset.adjustedRecipe[RecipeId.IronPlate],
        machines: rational.one,
      };
      const stepB: Step = { id: '1', itemId: ItemId.IronOre };
      service.calculateParentsOutputs(stepA, [stepA, stepB]);
      expect(service.addEntityValue).toHaveBeenCalledWith(
        stepB,
        'parents',
        '0',
        rational(47n, 16n),
      );
      expect(service.addEntityValue).toHaveBeenCalledWith(
        stepA,
        'outputs',
        'iron-plate',
        rational(141n, 40n),
      );
    });
  });

  describe('calculateSettings', () => {
    it('should add recipe settings to a recipe step', () => {
      const step: Step = {
        id: '1',
        recipeId: RecipeId.Coal,
      };
      service.calculateSettings(step, {}, Mocks.recipesStateInitial);
      expect(step.recipeSettings).toEqual(
        Mocks.recipesStateInitial[RecipeId.Coal],
      );
    });

    it('should add recipe settings to a recipe objective step', () => {
      const step: Step = {
        id: '0',
        recipeId: RecipeId.Coal,
        recipeObjectiveId: '0',
      };
      const recipeObjectives: Entities<ObjectiveSettings> = {
        ['0']: {
          id: '0',
          targetId: RecipeId.Coal,
          value: rational.one,
          unit: ObjectiveUnit.Machines,
          type: ObjectiveType.Output,
          recipe: Mocks.adjustedDataset.adjustedRecipe[RecipeId.Coal],
        },
      };
      service.calculateSettings(
        step,
        recipeObjectives,
        Mocks.recipesStateInitial,
      );
      expect(step.recipeSettings).toEqual(recipeObjectives['0']);
    });
  });

  describe('calculateBelts', () => {
    it('should skip steps with no items', () => {
      const step: Step = {
        id: 'id',
        itemId: Mocks.item1.id,
      };
      service.calculateBelts(
        step,
        Mocks.itemsStateInitial,
        Mocks.beltSpeed,
        Mocks.adjustedDataset,
      );
      expect(step.belts).toBeUndefined();
    });

    it('should calculate required belts & wagons for steps', () => {
      const step: Step = {
        id: 'id',
        itemId: Mocks.item1.id,
        items: Mocks.beltSpeed[ItemId.ExpressTransportBelt],
        belts: rational.zero,
      };
      service.calculateBelts(
        step,
        Mocks.itemsStateInitial,
        Mocks.beltSpeed,
        Mocks.adjustedDataset,
      );
      expect(step.belts).toEqual(rational.one);
      expect(step.wagons).toEqual(rational(9n, 400n));
    });

    it('should calculate required wagons for fluids', () => {
      const step: Step = {
        id: 'id',
        itemId: ItemId.CrudeOil,
        items: rational(25000n),
        belts: rational.zero,
      };
      service.calculateBelts(
        step,
        Mocks.itemsStateInitial,
        Mocks.beltSpeed,
        Mocks.adjustedDataset,
      );
      expect(step.wagons).toEqual(rational.one);
    });

    it('should set to null for research recipes', () => {
      const step: Step = {
        id: 'id',
        itemId: ItemId.ArtilleryShellRange,
        recipeId: RecipeId.ArtilleryShellRange,
        items: rational.one,
        belts: rational.one,
        wagons: rational.one,
        recipeSettings: Mocks.recipesStateInitial[RecipeId.ArtilleryShellRange],
      };
      service.calculateBelts(
        step,
        Mocks.itemsStateInitial,
        Mocks.beltSpeed,
        Mocks.adjustedDataset,
      );
      expect(step.belts).toBeUndefined();
      expect(step.wagons).toBeUndefined();
    });

    it('should set to null for rocket part recipes', () => {
      const step: Step = {
        id: 'id',
        itemId: ItemId.RocketPart,
        recipeId: RecipeId.RocketPart,
        items: rational.one,
        belts: rational.one,
        wagons: rational.one,
        recipeSettings: Mocks.recipesStateInitial[RecipeId.RocketPart],
      };
      service.calculateBelts(
        step,
        Mocks.itemsStateInitial,
        Mocks.beltSpeed,
        Mocks.adjustedDataset,
      );
      expect(step.belts).toBeUndefined();
      expect(step.wagons).toBeUndefined();
    });

    it('should calculate including stack', () => {
      const step: Step = {
        id: 'id',
        itemId: Mocks.item1.id,
        items: Mocks.beltSpeed[ItemId.ExpressTransportBelt],
        belts: rational.zero,
      };
      service.calculateBelts(
        step,
        spread(Mocks.itemsStateInitial, {
          [Mocks.item1.id]: spread(Mocks.itemsStateInitial[Mocks.item1.id], {
            stack: rational(2n),
          }),
        }),
        Mocks.beltSpeed,
        Mocks.adjustedDataset,
      );
      expect(step.belts).toEqual(rational(1n, 2n));
      expect(step.wagons).toEqual(rational(9n, 400n));
    });
  });

  describe('calculateBeacons', () => {
    it('should calculate the number of beacons', () => {
      const step: Step = {
        id: 'id',
        itemId: ItemId.Coal,
        items: rational.one,
        recipeId: RecipeId.Coal,
        machines: rational.one,
        power: rational.zero,
        recipeSettings: Mocks.recipesStateInitial[RecipeId.Coal],
      };
      service.calculateBeacons(step, rational.one, Mocks.adjustedDataset);
      expect(step.power).toEqual(rational(3840n));
    });

    it('should not allow less beacons than beacon count', () => {
      const step: Step = {
        id: 'id',
        itemId: ItemId.Coal,
        items: rational.one,
        recipeId: RecipeId.Coal,
        machines: rational.one,
        power: rational.zero,
        recipeSettings: Mocks.recipesStateInitial[RecipeId.Coal],
      };
      service.calculateBeacons(step, rational(100n), Mocks.adjustedDataset);
      expect(step.recipeSettings?.beacons?.[0].total).toEqual(rational(8n));
    });

    it('should handle undefined step power', () => {
      const step: Step = {
        id: 'id',
        itemId: ItemId.Coal,
        items: rational.one,
        recipeId: RecipeId.Coal,
        machines: rational.one,
        recipeSettings: Mocks.recipesStateInitial[RecipeId.Coal],
      };
      service.calculateBeacons(step, rational.one, Mocks.adjustedDataset);
      expect(step.power).toEqual(rational(3840n));
    });

    it('should do nothing if beaconReceivers is unset', () => {
      const step: Step = { id: 'id' };
      service.calculateBeacons(step, undefined, Mocks.adjustedDataset);
      expect(step).toEqual({ id: 'id' });
    });

    it('should do nothing if step beacons is null', () => {
      const step: Step = {
        id: 'id',
        recipeId: RecipeId.IronOre,
        machines: rational.one,
        recipeSettings: {
          beacons: undefined,
        },
      };
      const stepExpect = spread(step);
      service.calculateBeacons(step, rational.one, Mocks.adjustedDataset);
      expect(step).toEqual(stepExpect);
    });
  });

  describe('calculateDisplayRate', () => {
    it('should apply the display rate', () => {
      const step: Step = {
        id: '0',
        items: rational.one,
        surplus: rational(2n),
        wagons: rational(3n),
        pollution: rational(4n),
        output: rational(5n),
        parents: { ['id']: rational(6n) },
      };
      service.calculateDisplayRate(
        step,
        displayRateInfo[DisplayRate.PerMinute],
      );
      expect(step.items).toEqual(rational(60n));
      expect(step.surplus).toEqual(rational(120n));
      expect(step.wagons).toEqual(rational(180n));
      expect(step.pollution).toEqual(rational(240n));
      expect(step.output).toEqual(rational(300n));
      expect(step.parents?.['id']).toEqual(rational(6n));
    });
  });

  describe('calculateChecked', () => {
    it('should set the checked state for an item step', () => {
      const step: Step = { id: '0', itemId: ItemId.Coal };
      service.calculateChecked(step, {
        checkedItemIds: new Set([ItemId.Coal]),
      } as any);
      expect(step.checked).toBeTrue();
    });

    it('should set the checked state for a recipe objective step', () => {
      const step: Step = { id: '0', recipeObjectiveId: '1' };
      service.calculateChecked(step, {
        checkedObjectiveIds: new Set(['1']),
      } as any);
      expect(step.checked).toBeTrue();
    });

    it('should set the checked state for a recipe step', () => {
      const step: Step = { id: '0', recipeId: RecipeId.Coal };
      service.calculateChecked(step, {
        checkedRecipeIds: new Set([RecipeId.Coal]),
      } as any);
      expect(step.checked).toBeTrue();
    });
  });

  describe('sortBySankey', () => {
    it('should sort steps based on sankey node depth', () => {
      const steps = [...Mocks.lightOilSteps];
      service.sortBySankey(steps);
      const ids = steps.map((s) => s.id);
      expect(ids).toEqual(['0', '3', '4', '2', '1']);
    });

    it('should handle invalid steps', () => {
      const steps = [...Mocks.lightOilSteps, { id: 'a' }, { id: 'b' }];
      service.sortBySankey(steps);
      const ids = steps.map((s) => s.id);
      expect(ids).toEqual(['0', '3', '4', '2', '1', 'a', 'b']);
    });

    it('should handle empty steps', () => {
      const steps: Step[] = [];
      service.sortBySankey(steps);
      expect(steps).toEqual([]);
    });

    it('should handle missing recipeId on parent', () => {
      const steps = [...Mocks.lightOilSteps];
      const broken = spread(steps[1], { parents: { '4': rational.one } });
      steps[1] = broken;
      service.sortBySankey(steps);
      const ids = steps.map((s) => s.id);
      expect(ids).toEqual(['0', '3', '4', '2', '1']);
    });
  });

  describe('calculateHierarchy', () => {
    it('should set up groups by parents', () => {
      spyOn(service, 'sortRecursive');
      const steps: Step[] = [
        {
          id: '0',
          itemId: ItemId.Coal,
          recipeId: RecipeId.Coal,
          items: rational.one,
          parents: { ['2']: rational.one },
        },
        {
          id: '1',
          itemId: ItemId.IronPlate,
          recipeId: RecipeId.IronPlate,
          items: rational.one,
          parents: {
            ['3']: rational.one,
            ['4']: rational.one,
          },
        },
        {
          id: '2',
          itemId: ItemId.PlasticBar,
          recipeId: RecipeId.PlasticBar,
          items: rational.one,
          parents: { ['2']: rational.one },
        },
        {
          id: '3',
          itemId: ItemId.CopperPlate,
          recipeId: RecipeId.CopperPlate,
          items: rational.one,
          parents: {
            ['2']: rational.one,
            ['1']: rational.one,
          },
        },
        {
          id: '4',
          itemId: ItemId.PiercingRoundsMagazine,
          recipeId: RecipeId.PiercingRoundsMagazine,
          items: rational.one,
        },
      ];
      service.calculateHierarchy(steps);
      expect(service.sortRecursive).toHaveBeenCalledWith(
        {
          ['2']: [steps[0]],
          ['']: [steps[1], steps[2], steps[3], steps[4]],
        },
        '',
        jasmine.any(Object),
      );
    });

    it('should handle steps not connected to root', () => {
      const steps: Step[] = [
        {
          id: '0',
          itemId: ItemId.Coal,
          recipeId: RecipeId.Coal,
          recipe: Mocks.adjustedDataset.adjustedRecipe[RecipeId.Coal],
          items: rational.one,
          parents: { [RecipeId.PlasticBar]: rational.one },
        },
        {
          id: '1',
          itemId: ItemId.PlasticBar,
          recipeId: RecipeId.PlasticBar,
          recipe: Mocks.adjustedDataset.adjustedRecipe[RecipeId.PlasticBar],
          items: rational.one,
          parents: { [RecipeId.Coal]: rational.one },
        },
      ];
      const sorted = service.calculateHierarchy(steps);
      expect(sorted.length).toEqual(steps.length);
    });
  });

  describe('sortRecursive', () => {
    it('should sort groups by hierarchy', () => {
      const steps: Step[] = [
        {
          id: `${ItemId.Coal}.${RecipeId.Coal}`,
          itemId: ItemId.Coal,
          recipeId: RecipeId.Coal,
          items: rational.one,
          parents: { [RecipeId.PlasticBar]: rational.one },
        },
        {
          id: `${ItemId.IronOre}.${RecipeId.IronOre}`,
          itemId: ItemId.IronOre,
          recipeId: RecipeId.IronOre,
          items: rational.one,
          parents: {
            [RecipeId.CopperCable]: rational.one,
            [RecipeId.WoodenChest]: rational.one,
          },
        },
        {
          id: `${ItemId.PlasticBar}.${RecipeId.PlasticBar}`,
          itemId: ItemId.PlasticBar,
          recipeId: RecipeId.PlasticBar,
          items: rational.one,
        },
      ];
      const result = new Set<Step>();
      service.sortRecursive(
        {
          [`${ItemId.PlasticBar}.${RecipeId.PlasticBar}`]: [steps[0]],
          ['']: [steps[1], steps[2]],
        },
        '',
        result,
      );
      expect(result).toEqual(new Set([steps[1], steps[2], steps[0]]));
    });
  });

  describe('copy', () => {
    it('should create a copy of steps', () => {
      const steps: Step[] = [
        {
          id: 'id',
          itemId: ItemId.Coal,
          items: rational.one,
        },
        {
          id: 'id',
          itemId: ItemId.Coal,
          items: rational.one,
          parents: {
            [RecipeId.IronOre]: rational.one,
          },
        },
      ];
      const result = service.copy(steps);
      steps[1].parents![RecipeId.CrudeOil] = rational.one;
      expect(result[1].parents?.[RecipeId.CrudeOil]).toBeUndefined();
    });
  });
});

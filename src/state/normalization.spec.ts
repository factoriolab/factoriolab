import { TestBed } from '@angular/core/testing';

import { rational } from '~/rational/rational';
import { Step } from '~/solver/step';
import { ItemId } from '~/tests/item-id';
import { Mocks } from '~/tests/mocks/mocks';
import { RecipeId } from '~/tests/recipe-id';
import { TestModule } from '~/tests/test-module';
import { spread } from '~/utils/object';

import { Normalization } from './normalization';
import { ObjectiveSettings } from './objectives/objective';
import { ObjectiveType } from './objectives/objective-type';
import { ObjectiveUnit } from './objectives/objective-unit';

describe('Normalization', () => {
  let service: Normalization;
  let mocks: Mocks;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestModule] });
    service = TestBed.inject(Normalization);
    mocks = TestBed.inject(Mocks);
  });

  describe('normalizeRate', () => {
    it('should skip on maximize objectives', () => {
      expect(
        service.normalizeRate({
          id: '0',
          targetId: ItemId.Coal,
          value: rational.one,
          unit: ObjectiveUnit.Belts,
          type: ObjectiveType.Maximize,
        }),
      ).toEqual(rational.one);
    });

    it('should normalize item objective rates based on display rate', () => {
      expect(
        service.normalizeRate({
          id: '0',
          targetId: ItemId.Coal,
          value: rational.one,
          unit: ObjectiveUnit.Items,
          type: ObjectiveType.Output,
        }),
      ).toEqual(rational(1n, 60n));
    });

    it('should normalize item objective rates based on belts', () => {
      expect(
        service.normalizeRate({
          id: '0',
          targetId: ItemId.Coal,
          value: rational.one,
          unit: ObjectiveUnit.Belts,
          type: ObjectiveType.Output,
        }),
      ).toEqual(rational(45n));
    });

    it('should normalize item objective rates based on wagons', () => {
      expect(
        service.normalizeRate({
          id: '0',
          targetId: ItemId.Coal,
          value: rational.one,
          unit: ObjectiveUnit.Wagons,
          type: ObjectiveType.Output,
        }),
      ).toEqual(rational(100n, 3n));

      expect(
        service.normalizeRate({
          id: '0',
          targetId: ItemId.PetroleumGas,
          value: rational.one,
          unit: ObjectiveUnit.Wagons,
          type: ObjectiveType.Output,
        }),
      ).toEqual(rational(2500n, 3n));
    });
  });

  describe('normalizeSteps', () => {
    it('should update update various step fields after solution is found', () => {
      spyOn<any>(service, 'calculateSettings');
      spyOn<any>(service, 'calculateLogistics');
      spyOn<any>(service, 'calculateBeacons');
      spyOn<any>(service, 'calculateDisplayRate');
      spyOn<any>(service, 'calculateHierarchy');
      service.normalizeSteps([{ id: '0' }, { id: '1' }], []);
      expect(service['calculateSettings']).toHaveBeenCalledTimes(2);
      expect(service['calculateLogistics']).toHaveBeenCalledTimes(2);
      expect(service['calculateBeacons']).toHaveBeenCalledTimes(2);
      expect(service['calculateDisplayRate']).toHaveBeenCalledTimes(2);
      expect(service['calculateHierarchy']).toHaveBeenCalledTimes(1);
    });
  });

  describe('calculateParentsOutputs', () => {
    it('should add parent values for relevant steps', () => {
      spyOn<any>(service, 'addEntityValue');
      const stepA: Step = {
        id: '0',
        items: rational.one,
        itemId: ItemId.IronPlate,
        recipe:
          service['recipesStore'].adjustedDataset().adjustedRecipe[
            RecipeId.IronPlate
          ],
        machines: rational.one,
      };
      const stepB: Step = { id: '1', itemId: ItemId.IronOre };
      service['calculateParentsOutputs'](stepA, [stepA, stepB]);
      expect(service['addEntityValue']).toHaveBeenCalledWith(
        stepB,
        'parents',
        '0',
        rational(247n, 80n),
      );
      expect(service['addEntityValue']).toHaveBeenCalledWith(
        stepA,
        'outputs',
        'iron-plate',
        rational(741n, 200n),
      );
    });
  });

  describe('calculateSettings', () => {
    it('should add recipe settings to a recipe step', () => {
      const step: Step = {
        id: '1',
        recipeId: RecipeId.Coal,
      };
      service['calculateSettings'](step, {});
      expect(step.recipeSettings).toEqual(
        service['recipesStore'].settings()[RecipeId.Coal],
      );
    });

    it('should add recipe settings to a recipe objective step', () => {
      const step: Step = {
        id: '0',
        recipeId: RecipeId.Coal,
        recipeObjectiveId: '0',
      };
      const recipeObjectives: Record<string, ObjectiveSettings> = {
        ['0']: {
          id: '0',
          targetId: RecipeId.Coal,
          value: rational.one,
          unit: ObjectiveUnit.Machines,
          type: ObjectiveType.Output,
          recipe:
            service['recipesStore'].adjustedDataset().adjustedRecipe[
              RecipeId.Coal
            ],
        },
      };
      service['calculateSettings'](step, recipeObjectives);
      expect(step.recipeSettings).toEqual(recipeObjectives['0']);
    });
  });

  describe('calculateLogistics', () => {
    it('should skip steps with no items', () => {
      const step: Step = {
        id: 'id',
        itemId: mocks.item1().id,
      };
      service['calculateLogistics'](step);
      expect(step.belts).toBeUndefined();
    });

    it('should calculate required belts & wagons for steps', () => {
      const step: Step = {
        id: 'id',
        itemId: mocks.item1().id,
        items:
          service['settingsStore'].beltSpeed()[ItemId.ExpressTransportBelt],
        belts: rational.zero,
      };
      service['calculateLogistics'](step);
      expect(step.belts).toEqual(rational.one);
      expect(step.wagons).toEqual(rational(9n, 400n));
    });

    it('should calculate required wagons for fluids', () => {
      const step: Step = {
        id: 'id',
        itemId: ItemId.CrudeOil,
        items: rational(50000n),
        belts: rational.zero,
      };
      service['calculateLogistics'](step);
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
        recipeSettings:
          service['recipesStore'].settings()[RecipeId.ArtilleryShellRange],
      };
      service['calculateLogistics'](step);
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
        recipeSettings: service['recipesStore'].settings()[RecipeId.RocketPart],
      };
      service['calculateLogistics'](step);
      expect(step.belts).toBeUndefined();
      expect(step.wagons).toBeUndefined();
    });

    it('should calculate rockets', () => {
      const step: Step = {
        id: 'id',
        itemId: mocks.item1().id,
        items:
          service['settingsStore'].beltSpeed()[ItemId.ExpressTransportBelt],
      };
      const data = mocks.getAdjustedDataset();
      data.itemRecord[mocks.item1().id].rocketCapacity = rational(100n);
      service['calculateLogistics'](step);
      expect(step.rockets).toBeDefined();
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
        recipeSettings: service['recipesStore'].settings()[RecipeId.Coal],
      };
      spyOn(service['settingsStore'], 'settings').and.returnValue({
        beaconReceivers: rational.one,
      } as any);
      service['calculateBeacons'](step);
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
        recipeSettings: service['recipesStore'].settings()[RecipeId.Coal],
      };
      spyOn(service['settingsStore'], 'settings').and.returnValue({
        beaconReceivers: rational(100n),
      } as any);
      service['calculateBeacons'](step);
      expect(step.recipeSettings?.beacons?.[0].total).toEqual(rational(8n));
    });

    it('should handle undefined step power', () => {
      const step: Step = {
        id: 'id',
        itemId: ItemId.Coal,
        items: rational.one,
        recipeId: RecipeId.Coal,
        machines: rational.one,
        recipeSettings: service['recipesStore'].settings()[RecipeId.Coal],
      };
      spyOn(service['settingsStore'], 'settings').and.returnValue({
        beaconReceivers: rational.one,
      } as any);
      service['calculateBeacons'](step);
      expect(step.power).toEqual(rational(3840n));
    });

    it('should do nothing if beaconReceivers is unset', () => {
      const step: Step = { id: 'id' };
      service['calculateBeacons'](step);
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
      spyOn(service['settingsStore'], 'settings').and.returnValue({
        beaconReceivers: rational.one,
      } as any);
      service['calculateBeacons'](step);
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
        rockets: rational(7n),
      };
      service['calculateDisplayRate'](step);
      expect(step.items).toEqual(rational(60n));
      expect(step.surplus).toEqual(rational(120n));
      expect(step.wagons).toEqual(rational(180n));
      expect(step.pollution).toEqual(rational(240n));
      expect(step.output).toEqual(rational(300n));
      expect(step.parents?.['id']).toEqual(rational(6n));
      expect(step.rockets).toEqual(rational(420n));
    });
  });

  describe('calculateChecked', () => {
    it('should set the checked state for an item step', () => {
      const step: Step = { id: '0', itemId: ItemId.Coal };
      spyOn(service['settingsStore'], 'settings').and.returnValue({
        checkedItemIds: new Set([ItemId.Coal]),
      } as any);
      service['calculateChecked'](step);
      expect(step.checked).toBeTrue();
    });

    it('should set the checked state for a recipe objective step', () => {
      const step: Step = { id: '0', recipeObjectiveId: '1' };
      spyOn(service['settingsStore'], 'settings').and.returnValue({
        checkedObjectiveIds: new Set(['1']),
      } as any);
      service['calculateChecked'](step);
      expect(step.checked).toBeTrue();
    });

    it('should set the checked state for a recipe step', () => {
      const step: Step = { id: '0', recipeId: RecipeId.Coal };
      spyOn(service['settingsStore'], 'settings').and.returnValue({
        checkedRecipeIds: new Set([RecipeId.Coal]),
      } as any);
      service['calculateChecked'](step);
      expect(step.checked).toBeTrue();
    });
  });

  describe('sortBySankey', () => {
    it('should sort steps based on sankey node depth', () => {
      const steps = [...mocks.lightOilSteps()];
      service['sortBySankey'](steps);
      const ids = steps.map((s) => s.id);
      expect(ids).toEqual(['0', '3', '4', '2', '1']);
    });

    it('should handle invalid steps', () => {
      const steps = [...mocks.lightOilSteps(), { id: 'a' }, { id: 'b' }];
      service['sortBySankey'](steps);
      const ids = steps.map((s) => s.id);
      expect(ids).toEqual(['0', '3', '4', '2', '1', 'a', 'b']);
    });

    it('should handle empty steps', () => {
      const steps: Step[] = [];
      service['sortBySankey'](steps);
      expect(steps).toEqual([]);
    });

    it('should handle missing recipeId on parent', () => {
      const steps = [...mocks.lightOilSteps()];
      const broken = spread(steps[1], { parents: { '4': rational.one } });
      steps[1] = broken;
      service['sortBySankey'](steps);
      const ids = steps.map((s) => s.id);
      expect(ids).toEqual(['0', '3', '4', '2', '1']);
    });
  });

  describe('calculateHierarchy', () => {
    it('should set up groups by parents', () => {
      spyOn<any>(service, 'sortRecursive');
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
      service['calculateHierarchy'](steps);
      expect(service['sortRecursive']).toHaveBeenCalledWith(
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
          recipe:
            service['recipesStore'].adjustedDataset().adjustedRecipe[
              RecipeId.Coal
            ],
          items: rational.one,
          parents: { [RecipeId.PlasticBar]: rational.one },
        },
        {
          id: '1',
          itemId: ItemId.PlasticBar,
          recipeId: RecipeId.PlasticBar,
          recipe:
            service['recipesStore'].adjustedDataset().adjustedRecipe[
              RecipeId.PlasticBar
            ],
          items: rational.one,
          parents: { [RecipeId.Coal]: rational.one },
        },
      ];
      const sorted = service['calculateHierarchy'](steps);
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
      service['sortRecursive'](
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

  describe('addEntityValue', () => {
    it('should add parents field to step', () => {
      const step = spread(mocks.step1());
      service['addEntityValue'](step, 'parents', ItemId.Coal, rational.one);
      expect(step.parents).toEqual({ [ItemId.Coal]: rational.one });
    });

    it('should add to existing parents object value', () => {
      const step = spread(mocks.step1(), {
        parents: { [ItemId.Coal]: rational.zero },
      });
      service['addEntityValue'](step, 'parents', ItemId.Coal, rational.one);
      expect(step.parents).toEqual({ [ItemId.Coal]: rational.one });
    });

    it('should add a new key to an existing parents object', () => {
      const step = spread(mocks.step1(), { parents: {} });
      service['addEntityValue'](step, 'parents', ItemId.Coal, rational.one);
      expect(step.parents).toEqual({ [ItemId.Coal]: rational.one });
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
      const result = service['copy'](steps);
      steps[1].parents![RecipeId.CrudeOil] = rational.one;
      expect(result[1].parents?.[RecipeId.CrudeOil]).toBeUndefined();
    });
  });
});

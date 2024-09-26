import { spread } from '~/helpers';
import { DisplayRate, displayRateInfo } from '~/models/enum/display-rate';
import { Game } from '~/models/enum/game';
import { ObjectiveType } from '~/models/enum/objective-type';
import { ObjectiveUnit } from '~/models/enum/objective-unit';
import { ObjectiveSettings } from '~/models/objective';
import { rational } from '~/models/rational';
import { Step } from '~/models/step';
import { Entities } from '~/models/utils';
import { ItemId, Mocks, RecipeId } from '~/tests';

import { RateUtility } from './rate.utility';

describe('RateUtility', () => {
  describe('objectiveNormalizedRate', () => {
    it('should skip on maximize objectives', () => {
      expect(
        RateUtility.objectiveNormalizedRate(
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
        RateUtility.objectiveNormalizedRate(
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
        RateUtility.objectiveNormalizedRate(
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
        RateUtility.objectiveNormalizedRate(
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
        RateUtility.objectiveNormalizedRate(
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
        RateUtility.objectiveNormalizedRate(
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
      RateUtility.addEntityValue(step, 'parents', ItemId.Coal, rational.one);
      expect(step.parents).toEqual({ [ItemId.Coal]: rational.one });
    });

    it('should add to existing parents object value', () => {
      const step = spread(Mocks.step1, {
        parents: { [ItemId.Coal]: rational.zero },
      });
      RateUtility.addEntityValue(step, 'parents', ItemId.Coal, rational.one);
      expect(step.parents).toEqual({ [ItemId.Coal]: rational.one });
    });

    it('should add a new key to an existing parents object', () => {
      const step = spread(Mocks.step1, { parents: {} });
      RateUtility.addEntityValue(step, 'parents', ItemId.Coal, rational.one);
      expect(step.parents).toEqual({ [ItemId.Coal]: rational.one });
    });
  });

  describe('adjustPowerPollution', () => {
    it('should handle no machines', () => {
      const step: any = { machines: null };
      const result = spread(step);
      RateUtility.adjustPowerPollution(
        result,
        Mocks.adjustedDataset.adjustedRecipe[RecipeId.WoodenChest],
        Game.Factorio,
      );
      expect(result).toEqual(step);
    });

    it('should handle null drain/consumption/pollution', () => {
      const step: any = { machines: rational.one };
      const result = spread(step);
      const recipe: any = { drain: null, consumption: null, pollution: null };
      RateUtility.adjustPowerPollution(result, recipe, Game.Factorio);
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
      RateUtility.adjustPowerPollution(result, recipe, Game.Factorio);
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
      RateUtility.adjustPowerPollution(result, recipe, Game.DysonSphereProgram);
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
      RateUtility.adjustPowerPollution(result, recipe, Game.Factorio);
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
      RateUtility.adjustPowerPollution(step, recipe, Game.Factorio);
      expect(step).toEqual({
        machines: rational(3n, 2n),
        power: rational(12n),
        pollution: rational(15n, 2n),
      });
    });
  });

  describe('normalizeSteps', () => {
    it('should update update various step fields after solution is found', () => {
      spyOn(RateUtility, 'calculateParentsOutputs');
      spyOn(RateUtility, 'calculateSettings');
      spyOn(RateUtility, 'calculateBelts');
      spyOn(RateUtility, 'calculateBeacons');
      spyOn(RateUtility, 'calculateDisplayRate');
      spyOn(RateUtility, 'calculateHierarchy');
      RateUtility.normalizeSteps(
        [{ id: '0' }, { id: '1' }],
        [],
        {},
        {},
        {},
        displayRateInfo[DisplayRate.PerMinute],
        Mocks.settingsStateInitial,
        Mocks.adjustedDataset,
      );
      expect(RateUtility.calculateParentsOutputs).toHaveBeenCalledTimes(2);
      expect(RateUtility.calculateSettings).toHaveBeenCalledTimes(2);
      expect(RateUtility.calculateBelts).toHaveBeenCalledTimes(2);
      expect(RateUtility.calculateBeacons).toHaveBeenCalledTimes(2);
      expect(RateUtility.calculateDisplayRate).toHaveBeenCalledTimes(2);
      expect(RateUtility.calculateHierarchy).toHaveBeenCalledTimes(1);
    });
  });

  describe('calculateParentsOutputs', () => {
    it('should add parent values for relevant steps', () => {
      spyOn(RateUtility, 'addEntityValue');
      const stepA: Step = {
        id: '0',
        items: rational.one,
        itemId: ItemId.IronPlate,
        recipe: Mocks.adjustedDataset.adjustedRecipe[RecipeId.IronPlate],
        machines: rational.one,
      };
      const stepB: Step = { id: '1', itemId: ItemId.IronOre };
      RateUtility.calculateParentsOutputs(stepA, [stepA, stepB]);
      expect(RateUtility.addEntityValue).toHaveBeenCalledWith(
        stepB,
        'parents',
        '0',
        rational(47n, 16n),
      );
      expect(RateUtility.addEntityValue).toHaveBeenCalledWith(
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
      RateUtility.calculateSettings(step, {}, Mocks.recipesStateInitial);
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
      RateUtility.calculateSettings(
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
      RateUtility.calculateBelts(
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
      RateUtility.calculateBelts(
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
      RateUtility.calculateBelts(
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
      RateUtility.calculateBelts(
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
      RateUtility.calculateBelts(
        step,
        Mocks.itemsStateInitial,
        Mocks.beltSpeed,
        Mocks.adjustedDataset,
      );
      expect(step.belts).toBeUndefined();
      expect(step.wagons).toBeUndefined();
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
      RateUtility.calculateBeacons(step, rational.one, Mocks.adjustedDataset);
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
      RateUtility.calculateBeacons(step, rational(100n), Mocks.adjustedDataset);
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
      RateUtility.calculateBeacons(step, rational.one, Mocks.adjustedDataset);
      expect(step.power).toEqual(rational(3840n));
    });

    it('should do nothing if beaconReceivers is unset', () => {
      const step: Step = { id: 'id' };
      RateUtility.calculateBeacons(step, undefined, Mocks.adjustedDataset);
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
      RateUtility.calculateBeacons(step, rational.one, Mocks.adjustedDataset);
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
      RateUtility.calculateDisplayRate(
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
      RateUtility.calculateChecked(step, {
        checkedItemIds: new Set([ItemId.Coal]),
      } as any);
      expect(step.checked).toBeTrue();
    });

    it('should set the checked state for a recipe objective step', () => {
      const step: Step = { id: '0', recipeObjectiveId: '1' };
      RateUtility.calculateChecked(step, {
        checkedObjectiveIds: new Set(['1']),
      } as any);
      expect(step.checked).toBeTrue();
    });

    it('should set the checked state for a recipe step', () => {
      const step: Step = { id: '0', recipeId: RecipeId.Coal };
      RateUtility.calculateChecked(step, {
        checkedRecipeIds: new Set([RecipeId.Coal]),
      } as any);
      expect(step.checked).toBeTrue();
    });
  });

  describe('sortBySankey', () => {
    it('should sort steps based on sankey node depth', () => {
      const steps = [...Mocks.lightOilSteps];
      RateUtility.sortBySankey(steps);
      const ids = steps.map((s) => s.id);
      expect(ids).toEqual(['0', '3', '4', '2', '1']);
    });

    it('should handle invalid steps', () => {
      const steps = [...Mocks.lightOilSteps, { id: 'a' }, { id: 'b' }];
      RateUtility.sortBySankey(steps);
      const ids = steps.map((s) => s.id);
      expect(ids).toEqual(['0', '3', '4', '2', '1', 'a', 'b']);
    });

    it('should handle empty steps', () => {
      const steps: Step[] = [];
      RateUtility.sortBySankey(steps);
      expect(steps).toEqual([]);
    });

    it('should handle missing recipeId on parent', () => {
      const steps = [...Mocks.lightOilSteps];
      const broken = spread(steps[1], { parents: { '4': rational.one } });
      steps[1] = broken;
      RateUtility.sortBySankey(steps);
      const ids = steps.map((s) => s.id);
      expect(ids).toEqual(['0', '3', '4', '2', '1']);
    });
  });

  describe('calculateHierarchy', () => {
    it('should set up groups by parents', () => {
      spyOn(RateUtility, 'sortRecursive').and.returnValue([]);
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
      RateUtility.calculateHierarchy(steps);
      expect(RateUtility.sortRecursive).toHaveBeenCalledWith(
        {
          ['2']: [steps[0]],
          ['']: [steps[1], steps[2], steps[3], steps[4]],
        },
        '',
        [],
      );
    });

    it('should handle steps not connected to root', () => {
      const steps: Step[] = [
        {
          id: 'id',
          itemId: ItemId.Coal,
          recipeId: RecipeId.Coal,
          recipe: Mocks.adjustedDataset.adjustedRecipe[RecipeId.Coal],
          items: rational.one,
          parents: { [RecipeId.PlasticBar]: rational.one },
        },
        {
          id: 'id',
          itemId: ItemId.PlasticBar,
          recipeId: RecipeId.PlasticBar,
          recipe: Mocks.adjustedDataset.adjustedRecipe[RecipeId.PlasticBar],
          items: rational.one,
          parents: { [RecipeId.Coal]: rational.one },
        },
      ];
      const sorted = RateUtility.calculateHierarchy(steps);
      expect(sorted.length).toEqual(steps.length);
    });
  });

  describe('sortRecursive', () => {
    it('should return empty array if no group matches id', () => {
      const result = RateUtility.sortRecursive({}, 'id', ['item'] as any);
      expect(result).toEqual([]);
    });

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
      const result = RateUtility.sortRecursive(
        {
          [`${ItemId.PlasticBar}.${RecipeId.PlasticBar}`]: [steps[0]],
          ['']: [steps[1], steps[2]],
        },
        '',
        [],
      );
      expect(result).toEqual([steps[1], steps[2], steps[0]]);
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
      const result = RateUtility.copy(steps);
      steps[1].parents![RecipeId.CrudeOil] = rational.one;
      expect(result[1].parents?.[RecipeId.CrudeOil]).toBeUndefined();
    });
  });
});

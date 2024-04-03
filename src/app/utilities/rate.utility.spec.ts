import { ItemId, Mocks, RecipeId } from 'src/tests';
import {
  DisplayRate,
  displayRateInfo,
  Entities,
  Game,
  ObjectiveType,
  ObjectiveUnit,
  rational,
  RecipeObjective,
  RecipeSettings,
  Step,
} from '~/models';
import { RateUtility } from './rate.utility';

describe('RateUtility', () => {
  describe('objectiveNormalizedRate', () => {
    it('should skip on maximize objectives', () => {
      expect(
        RateUtility.objectiveNormalizedRate(
          {
            id: '0',
            targetId: ItemId.Coal,
            value: rational(1n),
            unit: ObjectiveUnit.Belts,
            type: ObjectiveType.Maximize,
          },
          Mocks.ItemsStateInitial,
          Mocks.BeltSpeed,
          Mocks.DisplayRateInfo,
          Mocks.AdjustedDataset,
        ),
      ).toEqual(rational(1n));
    });

    it('should normalize item objective rates based on display rate', () => {
      expect(
        RateUtility.objectiveNormalizedRate(
          {
            id: '0',
            targetId: ItemId.Coal,
            value: rational(1n),
            unit: ObjectiveUnit.Items,
            type: ObjectiveType.Output,
          },
          Mocks.ItemsStateInitial,
          Mocks.BeltSpeed,
          Mocks.DisplayRateInfo,
          Mocks.AdjustedDataset,
        ),
      ).toEqual(rational(1n, 60n));
    });

    it('should normalize item objective rates based on belts', () => {
      expect(
        RateUtility.objectiveNormalizedRate(
          {
            id: '0',
            targetId: ItemId.Coal,
            value: rational(1n),
            unit: ObjectiveUnit.Belts,
            type: ObjectiveType.Output,
          },
          Mocks.ItemsStateInitial,
          Mocks.BeltSpeed,
          Mocks.DisplayRateInfo,
          Mocks.AdjustedDataset,
        ),
      ).toEqual(rational(15n));
    });

    it('should normalize item objective rates based on wagons', () => {
      expect(
        RateUtility.objectiveNormalizedRate(
          {
            id: '0',
            targetId: ItemId.Coal,
            value: rational(1n),
            unit: ObjectiveUnit.Wagons,
            type: ObjectiveType.Output,
          },
          Mocks.ItemsStateInitial,
          Mocks.BeltSpeed,
          Mocks.DisplayRateInfo,
          Mocks.AdjustedDataset,
        ),
      ).toEqual(rational(100n, 3n));

      expect(
        RateUtility.objectiveNormalizedRate(
          {
            id: '0',
            targetId: ItemId.PetroleumGas,
            value: rational(1n),
            unit: ObjectiveUnit.Wagons,
            type: ObjectiveType.Output,
          },
          Mocks.ItemsStateInitial,
          Mocks.BeltSpeed,
          Mocks.DisplayRateInfo,
          Mocks.AdjustedDataset,
        ),
      ).toEqual(rational(1250n, 3n));
    });

    it('should adjust technology objective rate by productivity', () => {
      expect(
        RateUtility.objectiveNormalizedRate(
          {
            id: '0',
            targetId: ItemId.ArtilleryShellRange,
            value: rational(1n),
            unit: ObjectiveUnit.Items,
            type: ObjectiveType.Output,
          },
          Mocks.ItemsStateInitial,
          Mocks.BeltSpeed,
          Mocks.DisplayRateInfo,
          Mocks.AdjustedDataset,
        ),
      ).toEqual(rational(1n, 50n));
    });
  });

  describe('addEntityValue', () => {
    it('should add parents field to step', () => {
      const step = { ...Mocks.Step1 };
      RateUtility.addEntityValue(step, 'parents', ItemId.Coal, rational(1n));
      expect(step.parents).toEqual({ [ItemId.Coal]: rational(1n) });
    });

    it('should add to existing parents object value', () => {
      const step = {
        ...Mocks.Step1,
        ...{ parents: { [ItemId.Coal]: rational(0n) } },
      };
      RateUtility.addEntityValue(step, 'parents', ItemId.Coal, rational(1n));
      expect(step.parents).toEqual({ [ItemId.Coal]: rational(1n) });
    });

    it('should add a new key to an existing parents object', () => {
      const step = {
        ...Mocks.Step1,
        ...{ parents: {} },
      };
      RateUtility.addEntityValue(step, 'parents', ItemId.Coal, rational(1n));
      expect(step.parents).toEqual({ [ItemId.Coal]: rational(1n) });
    });
  });

  describe('adjustPowerPollution', () => {
    it('should handle no machines', () => {
      const step: any = { machines: null };
      const result = { ...step };
      RateUtility.adjustPowerPollution(
        result,
        Mocks.AdjustedDataset.adjustedRecipe[RecipeId.WoodenChest],
        Game.Factorio,
      );
      expect(result).toEqual(step);
    });

    it('should handle null drain/consumption/pollution', () => {
      const step: any = { machines: rational(1n) };
      const result = { ...step };
      const recipe: any = { drain: null, consumption: null, pollution: null };
      RateUtility.adjustPowerPollution(result, recipe, Game.Factorio);
      expect(result).toEqual(step);
    });

    it('should handle only drain', () => {
      const step: any = { machines: rational(1n) };
      const result = { ...step };
      const recipe: any = {
        drain: rational(2n),
        consumption: null,
        pollution: null,
      };
      RateUtility.adjustPowerPollution(result, recipe, Game.Factorio);
      expect(result).toEqual({
        machines: rational(1n),
        power: rational(2n),
      });
    });

    it('should handle account for non-cumulative DSP drain', () => {
      const step: any = { machines: rational(1n, 3n) };
      const result = { ...step };
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
      const step: any = { machines: rational(1n) };
      const result = { ...step };
      const recipe: any = {
        drain: null,
        consumption: rational(2n),
        pollution: null,
      };
      RateUtility.adjustPowerPollution(result, recipe, Game.Factorio);
      expect(result).toEqual({
        machines: rational(1n),
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
        null,
        {},
        displayRateInfo[DisplayRate.PerMinute],
        Mocks.AdjustedDataset,
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
        items: rational(1n),
        itemId: ItemId.IronPlate,
        recipe: Mocks.AdjustedDataset.adjustedRecipe[RecipeId.IronPlate],
        machines: rational(1n),
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
      RateUtility.calculateSettings(step, {}, Mocks.RecipesStateInitial);
      expect(step.recipeSettings).toEqual(
        Mocks.RecipesStateInitial[RecipeId.Coal],
      );
    });

    it('should add recipe settings to a recipe objective step', () => {
      const step: Step = {
        id: '0',
        recipeId: RecipeId.Coal,
        recipeObjectiveId: '0',
      };
      const recipeObjectives: Entities<RecipeObjective> = {
        ['0']: {
          id: '0',
          targetId: RecipeId.Coal,
          value: rational(1n),
          unit: ObjectiveUnit.Machines,
          type: ObjectiveType.Output,
          recipe: Mocks.AdjustedDataset.adjustedRecipe[RecipeId.Coal],
        },
      };
      RateUtility.calculateSettings(
        step,
        recipeObjectives,
        Mocks.RecipesStateInitial,
      );
      expect(step.recipeSettings).toEqual(recipeObjectives[0]);
    });
  });

  describe('calculateBelts', () => {
    it('should skip steps with no items', () => {
      const step: Step = {
        id: 'id',
        itemId: Mocks.Item1.id,
      };
      RateUtility.calculateBelts(
        step,
        Mocks.ItemsStateInitial,
        Mocks.BeltSpeed,
        Mocks.AdjustedDataset,
      );
      expect(step.belts).toBeUndefined();
    });

    it('should calculate required belts & wagons for steps', () => {
      const step: Step = {
        id: 'id',
        itemId: Mocks.Item1.id,
        items: Mocks.BeltSpeed[ItemId.TransportBelt],
        belts: rational(0n),
      };
      RateUtility.calculateBelts(
        step,
        Mocks.ItemsStateInitial,
        Mocks.BeltSpeed,
        Mocks.AdjustedDataset,
      );
      expect(step.belts).toEqual(rational(1n));
      expect(step.wagons).toEqual(rational(3n, 400n));
    });

    it('should calculate required wagons for fluids', () => {
      const step: Step = {
        id: 'id',
        itemId: ItemId.CrudeOil,
        items: rational(25000n),
        belts: rational(0n),
      };
      RateUtility.calculateBelts(
        step,
        Mocks.ItemsStateInitial,
        Mocks.BeltSpeed,
        Mocks.AdjustedDataset,
      );
      expect(step.wagons).toEqual(rational(1n));
    });

    it('should set to null for research recipes', () => {
      const step: Step = {
        id: 'id',
        itemId: ItemId.ArtilleryShellRange,
        recipeId: RecipeId.ArtilleryShellRange,
        items: rational(1n),
        belts: rational(1n),
        wagons: rational(1n),
        recipeSettings: Mocks.RecipesStateInitial[RecipeId.ArtilleryShellRange],
      };
      RateUtility.calculateBelts(
        step,
        Mocks.ItemsStateInitial,
        Mocks.BeltSpeed,
        Mocks.AdjustedDataset,
      );
      expect(step.belts).toBeUndefined();
      expect(step.wagons).toBeUndefined();
    });

    it('should set to null for rocket part recipes', () => {
      const step: Step = {
        id: 'id',
        itemId: ItemId.RocketPart,
        recipeId: RecipeId.RocketPart,
        items: rational(1n),
        belts: rational(1n),
        wagons: rational(1n),
        recipeSettings: Mocks.RecipesStateInitial[RecipeId.RocketPart],
      };
      RateUtility.calculateBelts(
        step,
        Mocks.ItemsStateInitial,
        Mocks.BeltSpeed,
        Mocks.AdjustedDataset,
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
        items: rational(1n),
        recipeId: RecipeId.Coal,
        machines: rational(1n),
        power: rational(0n),
        recipeSettings: Mocks.RecipesStateInitial[RecipeId.Coal],
      };
      RateUtility.calculateBeacons(step, rational(1n), Mocks.AdjustedDataset);
      expect(step.power).toEqual(rational(3840n));
    });

    it('should not allow less beacons than beacon count', () => {
      const step: Step = {
        id: 'id',
        itemId: ItemId.Coal,
        items: rational(1n),
        recipeId: RecipeId.Coal,
        machines: rational(1n),
        power: rational(0n),
        recipeSettings: Mocks.RecipesStateInitial[RecipeId.Coal],
      };
      RateUtility.calculateBeacons(step, rational(100n), Mocks.AdjustedDataset);
      expect(step.recipeSettings?.beacons?.[0].total).toEqual(rational(8n));
    });

    it('should handle undefined step power', () => {
      const step: Step = {
        id: 'id',
        itemId: ItemId.Coal,
        items: rational(1n),
        recipeId: RecipeId.Coal,
        machines: rational(1n),
        recipeSettings: Mocks.RecipesStateInitial[RecipeId.Coal],
      };
      RateUtility.calculateBeacons(step, rational(1n), Mocks.AdjustedDataset);
      expect(step.power).toEqual(rational(3840n));
    });

    it('should override from recipe settings', () => {
      const recipeSettings: RecipeSettings = {
        beacons: [
          {
            count: rational(8n),
            id: ItemId.Beacon,
            total: rational(1n),
          },
        ],
      };
      const step: Step = {
        id: 'id',
        itemId: ItemId.Coal,
        items: rational(1n),
        recipeId: RecipeId.Coal,
        machines: rational(1n),
        power: rational(0n),
        recipeSettings,
      };
      RateUtility.calculateBeacons(step, rational(1n), Mocks.AdjustedDataset);
      expect(step.power).toEqual(rational(480n));
    });

    it('should do nothing if beaconReceivers is unset', () => {
      const step: Step = { id: 'id' };
      RateUtility.calculateBeacons(step, null, Mocks.AdjustedDataset);
      expect(step).toEqual({ id: 'id' });
    });

    it('should do nothing if step beacons is null', () => {
      const step: Step = {
        id: 'id',
        recipeId: RecipeId.IronOre,
        machines: rational(1n),
        recipeSettings: {
          beacons: undefined,
        },
      };
      const stepExpect = { ...step };
      RateUtility.calculateBeacons(step, rational(1n), Mocks.AdjustedDataset);
      expect(step).toEqual(stepExpect);
    });
  });

  describe('calculateDisplayRate', () => {
    it('should apply the display rate', () => {
      const step: Step = {
        id: '0',
        items: rational(1n),
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
      RateUtility.calculateChecked(
        step,
        { [ItemId.Coal]: { checked: true } },
        {},
        {},
      );
      expect(step.checked).toBeTrue();
    });

    it('should set the checked state for a recipe objective step', () => {
      const step: Step = { id: '0', recipeObjectiveId: '1' };
      RateUtility.calculateChecked(
        step,
        {},
        {},
        {
          ['1']: {
            checked: true,
          } as any,
        },
      );
      expect(step.checked).toBeTrue();
    });

    it('should set the checked state for a recipe step', () => {
      const step: Step = { id: '0', recipeId: RecipeId.Coal };
      RateUtility.calculateChecked(
        step,
        {},
        { [RecipeId.Coal]: { checked: true } },
        {},
      );
      expect(step.checked).toBeTrue();
    });
  });

  describe('sortBySankey', () => {
    it('should sort steps based on sankey node depth', () => {
      const steps = [...Mocks.LightOilSteps];
      RateUtility.sortBySankey(steps);
      const ids = steps.map((s) => s.id);
      expect(ids).toEqual(['0', '3', '4', '2', '1']);
    });

    it('should handle invalid steps', () => {
      const steps = [...Mocks.LightOilSteps, { id: 'a' }, { id: 'b' }];
      RateUtility.sortBySankey(steps);
      const ids = steps.map((s) => s.id);
      expect(ids).toEqual(['0', '3', '4', '2', '1', 'a', 'b']);
    });

    it('should handle empty steps', () => {
      const steps: Step[] = [];
      RateUtility.sortBySankey(steps);
      expect(steps).toEqual([]);
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
          items: rational(1n),
          parents: { ['2']: rational(1n) },
        },
        {
          id: '1',
          itemId: ItemId.IronPlate,
          recipeId: RecipeId.IronPlate,
          items: rational(1n),
          parents: {
            ['3']: rational(1n),
            ['4']: rational(1n),
          },
        },
        {
          id: '2',
          itemId: ItemId.PlasticBar,
          recipeId: RecipeId.PlasticBar,
          items: rational(1n),
          parents: { ['2']: rational(1n) },
        },
        {
          id: '3',
          itemId: ItemId.CopperPlate,
          recipeId: RecipeId.CopperPlate,
          items: rational(1n),
          parents: {
            ['2']: rational(1n),
            ['1']: rational(1n),
          },
        },
        {
          id: '4',
          itemId: ItemId.PiercingRoundsMagazine,
          recipeId: RecipeId.PiercingRoundsMagazine,
          items: rational(1n),
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
          recipe: Mocks.AdjustedDataset.adjustedRecipe[RecipeId.Coal],
          items: rational(1n),
          parents: { [RecipeId.PlasticBar]: rational(1n) },
        },
        {
          id: 'id',
          itemId: ItemId.PlasticBar,
          recipeId: RecipeId.PlasticBar,
          recipe: Mocks.AdjustedDataset.adjustedRecipe[RecipeId.PlasticBar],
          items: rational(1n),
          parents: { [RecipeId.Coal]: rational(1n) },
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
          items: rational(1n),
          parents: { [RecipeId.PlasticBar]: rational(1n) },
        },
        {
          id: `${ItemId.IronOre}.${RecipeId.IronOre}`,
          itemId: ItemId.IronOre,
          recipeId: RecipeId.IronOre,
          items: rational(1n),
          parents: {
            [RecipeId.CopperCable]: rational(1n),
            [RecipeId.WoodenChest]: rational(1n),
          },
        },
        {
          id: `${ItemId.PlasticBar}.${RecipeId.PlasticBar}`,
          itemId: ItemId.PlasticBar,
          recipeId: RecipeId.PlasticBar,
          items: rational(1n),
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
          items: rational(1n),
        },
        {
          id: 'id',
          itemId: ItemId.Coal,
          items: rational(1n),
          parents: {
            [RecipeId.IronOre]: rational(1n),
          },
        },
      ];
      const result = RateUtility.copy(steps);
      steps[1].parents![RecipeId.CrudeOil] = rational(1n);
      expect(result[1].parents?.[RecipeId.CrudeOil]).toBeUndefined();
    });
  });
});

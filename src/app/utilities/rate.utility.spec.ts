import { ItemId, Mocks, RecipeId } from 'src/tests';
import {
  DisplayRate,
  displayRateInf,
  Entities,
  Game,
  Rational,
  RecipeRtlCfg,
  RecipeRtlObj,
  Step,
} from '~/models';
import { RateUtility } from './rate.utility';

describe('RateUtility', () => {
  describe('addEntityValue', () => {
    it('should add parents field to step', () => {
      const step = { ...Mocks.Step1 };
      RateUtility.addEntityAmount(step, 'parents', ItemId.Coal, Rational.one);
      expect(step.parents).toEqual({ [ItemId.Coal]: Rational.one });
    });

    it('should add to existing parents object value', () => {
      const step = {
        ...Mocks.Step1,
        ...{ parents: { [ItemId.Coal]: Rational.zero } },
      };
      RateUtility.addEntityAmount(step, 'parents', ItemId.Coal, Rational.one);
      expect(step.parents).toEqual({ [ItemId.Coal]: Rational.one });
    });

    it('should add a new key to an existing parents object', () => {
      const step = {
        ...Mocks.Step1,
        ...{ parents: {} },
      };
      RateUtility.addEntityAmount(step, 'parents', ItemId.Coal, Rational.one);
      expect(step.parents).toEqual({ [ItemId.Coal]: Rational.one });
    });
  });

  describe('adjustPowerPollution', () => {
    it('should handle no machines', () => {
      const step: any = { machines: null };
      const result = { ...step };
      RateUtility.adjustPowerPollution(
        result,
        Mocks.AdjustedData.recipeR[RecipeId.WoodenChest],
        Game.Factorio
      );
      expect(result).toEqual(step);
    });

    it('should handle null drain/consumption/pollution', () => {
      const step: any = { machines: Rational.one };
      const result = { ...step };
      const recipe: any = { drain: null, consumption: null, pollution: null };
      RateUtility.adjustPowerPollution(result, recipe, Game.Factorio);
      expect(result).toEqual(step);
    });

    it('should handle only drain', () => {
      const step: any = { machines: Rational.one };
      const result = { ...step };
      const recipe: any = {
        drain: Rational.two,
        consumption: null,
        pollution: null,
      };
      RateUtility.adjustPowerPollution(result, recipe, Game.Factorio);
      expect(result).toEqual({
        machines: Rational.one,
        power: Rational.two,
      });
    });

    it('should handle account for non-cumulative DSP drain', () => {
      const step: any = { machines: Rational.from(1, 3) };
      const result = { ...step };
      const recipe: any = {
        drain: Rational.two,
        consumption: null,
        pollution: null,
      };
      RateUtility.adjustPowerPollution(result, recipe, Game.DysonSphereProgram);
      expect(result).toEqual({
        machines: Rational.from(1, 3),
        power: Rational.from(4, 3),
      });
    });

    it('should handle only consumption', () => {
      const step: any = { machines: Rational.one };
      const result = { ...step };
      const recipe: any = {
        drain: null,
        consumption: Rational.two,
        pollution: null,
      };
      RateUtility.adjustPowerPollution(result, recipe, Game.Factorio);
      expect(result).toEqual({
        machines: Rational.one,
        power: Rational.two,
      });
    });

    it('should calculate power/pollution', () => {
      const step: any = { machines: Rational.from(3, 2) };
      const recipe: any = {
        drain: Rational.from(3),
        consumption: Rational.from(4),
        pollution: Rational.from(5),
      };
      RateUtility.adjustPowerPollution(step, recipe, Game.Factorio);
      expect(step).toEqual({
        machines: Rational.from(3, 2),
        power: Rational.from(12),
        pollution: Rational.from(15, 2),
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
        displayRateInf[DisplayRate.PerMinute],
        Mocks.Dataset
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
        items: Rational.one,
        itemId: ItemId.IronPlate,
        recipe: Mocks.Dataset.recipeR[RecipeId.IronPlate],
        machines: Rational.one,
      };
      const stepB: Step = { id: '1', itemId: ItemId.IronOre };
      RateUtility.calculateParentsOutputs(stepA, [stepA, stepB]);
      expect(RateUtility.addEntityAmount).toHaveBeenCalledWith(
        stepB,
        'parents',
        '0',
        Rational.from(5, 16)
      );
      expect(RateUtility.addEntityAmount).toHaveBeenCalledWith(
        stepA,
        'outputs',
        'iron-plate',
        Rational.from(5, 16)
      );
    });
  });

  describe('calculateSettings', () => {
    it('should add recipe settings to a recipe step', () => {
      const step: Step = {
        id: '1',
        recipeId: RecipeId.Coal,
      };
      RateUtility.calculateSettings(
        step,
        {},
        Mocks.RationalRecipeSettingsInitial
      );
      expect(step.recipeSettings).toEqual(
        Mocks.RationalRecipeSettingsInitial[RecipeId.Coal]
      );
    });

    it('should add recipe settings to a producer step', () => {
      const step: Step = {
        id: '0',
        recipeId: RecipeId.Coal,
        recipeObjectiveId: '0',
      };
      const producers: Entities<RecipeRtlObj> = {
        ['0']: {
          id: '0',
          recipeId: RecipeId.Coal,
          count: Rational.one,
          recipe: Mocks.Dataset.recipeR[RecipeId.Coal],
        },
      };
      RateUtility.calculateSettings(
        step,
        producers,
        Mocks.RationalRecipeSettingsInitial
      );
      expect(step.recipeSettings).toEqual(producers[0]);
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
        Mocks.ItemSettingsInitial,
        Mocks.BeltSpeed,
        Mocks.AdjustedData
      );
      expect(step.belts).toBeUndefined();
    });

    it('should calculate required belts & wagons for steps', () => {
      const step: Step = {
        id: 'id',
        itemId: Mocks.Item1.id,
        items: Mocks.BeltSpeed[ItemId.TransportBelt],
        belts: Rational.zero,
      };
      RateUtility.calculateBelts(
        step,
        Mocks.ItemSettingsInitial,
        Mocks.BeltSpeed,
        Mocks.AdjustedData
      );
      expect(step.belts).toEqual(Rational.one);
      expect(step.wagons).toEqual(new Rational(BigInt(3), BigInt(400)));
    });

    it('should calculate required wagons for fluids', () => {
      const step: Step = {
        id: 'id',
        itemId: ItemId.CrudeOil,
        items: Rational.from(25000),
        belts: Rational.zero,
      };
      RateUtility.calculateBelts(
        step,
        Mocks.ItemSettingsInitial,
        Mocks.BeltSpeed,
        Mocks.AdjustedData
      );
      expect(step.wagons).toEqual(Rational.one);
    });

    it('should set to null for research recipes', () => {
      const step: Step = {
        id: 'id',
        itemId: ItemId.ArtilleryShellRange,
        recipeId: RecipeId.ArtilleryShellRange,
        items: Rational.one,
        belts: Rational.one,
        wagons: Rational.one,
        recipeSettings:
          Mocks.RationalRecipeSettingsInitial[RecipeId.ArtilleryShellRange],
      };
      RateUtility.calculateBelts(
        step,
        Mocks.ItemSettingsInitial,
        Mocks.BeltSpeed,
        Mocks.AdjustedData
      );
      expect(step.belts).toBeUndefined();
      expect(step.wagons).toBeUndefined();
    });

    it('should set to null for rocket part recipes', () => {
      const step: Step = {
        id: 'id',
        itemId: ItemId.RocketPart,
        recipeId: RecipeId.RocketPart,
        items: Rational.one,
        belts: Rational.one,
        wagons: Rational.one,
        recipeSettings:
          Mocks.RationalRecipeSettingsInitial[RecipeId.RocketPart],
      };
      RateUtility.calculateBelts(
        step,
        Mocks.ItemSettingsInitial,
        Mocks.BeltSpeed,
        Mocks.AdjustedData
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
        items: Rational.one,
        recipeId: RecipeId.Coal,
        machines: Rational.one,
        power: Rational.zero,
        recipeSettings: Mocks.RationalRecipeSettingsInitial[RecipeId.Coal],
      };
      RateUtility.calculateBeacons(step, Rational.one, Mocks.AdjustedData);
      expect(step.power).toEqual(Rational.from(3840));
    });

    it('should not allow less beacons than beacon count', () => {
      const step: Step = {
        id: 'id',
        itemId: ItemId.Coal,
        items: Rational.one,
        recipeId: RecipeId.Coal,
        machines: Rational.one,
        power: Rational.zero,
        recipeSettings: Mocks.RationalRecipeSettingsInitial[RecipeId.Coal],
      };
      RateUtility.calculateBeacons(step, Rational.hundred, Mocks.AdjustedData);
      expect(step.recipeSettings?.beacons?.[0].total).toEqual(Rational.from(8));
    });

    it('should handle undefined step power', () => {
      const step: Step = {
        id: 'id',
        itemId: ItemId.Coal,
        items: Rational.one,
        recipeId: RecipeId.Coal,
        machines: Rational.one,
        recipeSettings: Mocks.RationalRecipeSettingsInitial[RecipeId.Coal],
      };
      RateUtility.calculateBeacons(step, Rational.one, Mocks.AdjustedData);
      expect(step.power).toEqual(Rational.from(3840));
    });

    it('should override from recipe settings', () => {
      const recipeSettings: RecipeRtlCfg = {
        beacons: [
          {
            count: Rational.from(8),
            id: ItemId.Beacon,
            total: Rational.one,
          },
        ],
      };
      const step: Step = {
        id: 'id',
        itemId: ItemId.Coal,
        items: Rational.one,
        recipeId: RecipeId.Coal,
        machines: Rational.one,
        power: Rational.zero,
        recipeSettings,
      };
      RateUtility.calculateBeacons(step, Rational.one, Mocks.AdjustedData);
      expect(step.power).toEqual(Rational.from(480));
    });

    it('should do nothing if beaconReceivers is unset', () => {
      const step: Step = { id: 'id' };
      RateUtility.calculateBeacons(step, null, Mocks.AdjustedData);
      expect(step).toEqual({ id: 'id' });
    });

    it('should do nothing if step beacons is null', () => {
      const step: Step = {
        id: 'id',
        recipeId: RecipeId.IronOre,
        machines: Rational.one,
        recipeSettings: {
          beacons: undefined,
        },
      };
      const stepExpect = { ...step };
      RateUtility.calculateBeacons(step, Rational.one, Mocks.AdjustedData);
      expect(step).toEqual(stepExpect);
    });
  });

  describe('calculateDisplayRate', () => {
    it('should apply the display rate', () => {
      const step: Step = {
        id: '0',
        items: Rational.one,
        surplus: Rational.two,
        wagons: Rational.from(3),
        pollution: Rational.from(4),
        output: Rational.from(5),
        parents: { ['id']: Rational.from(6) },
      };
      RateUtility.calculateDisplayRate(
        step,
        displayRateInf[DisplayRate.PerMinute]
      );
      expect(step.items).toEqual(Rational.from(60));
      expect(step.surplus).toEqual(Rational.from(120));
      expect(step.wagons).toEqual(Rational.from(180));
      expect(step.pollution).toEqual(Rational.from(240));
      expect(step.output).toEqual(Rational.from(300));
      expect(step.parents?.['id']).toEqual(Rational.from(6));
    });
  });

  describe('calculateChecked', () => {
    it('should set the checked state for an item step', () => {
      const step: Step = { id: '0', itemId: ItemId.Coal };
      RateUtility.calculateChecked(
        step,
        { [ItemId.Coal]: { checked: true } },
        {},
        {}
      );
      expect(step.checked).toBeTrue();
    });

    it('should set the checked state for a producer step', () => {
      const step: Step = { id: '0', recipeObjectiveId: '1' };
      RateUtility.calculateChecked(
        step,
        {},
        {},
        {
          ['1']: {
            checked: true,
          } as any,
        }
      );
      expect(step.checked).toBeTrue();
    });

    it('should set the checked state for a recipe step', () => {
      const step: Step = { id: '0', recipeId: RecipeId.Coal };
      RateUtility.calculateChecked(
        step,
        {},
        { [RecipeId.Coal]: { checked: true } },
        {}
      );
      expect(step.checked).toBeTrue();
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
          items: Rational.one,
          parents: { ['2']: Rational.one },
        },
        {
          id: '1',
          itemId: ItemId.IronOre,
          recipeId: RecipeId.IronOre,
          items: Rational.one,
          parents: {
            ['1']: Rational.one,
          },
        },
        {
          id: '2',
          itemId: ItemId.PlasticBar,
          recipeId: RecipeId.PlasticBar,
          items: Rational.one,
        },
      ];
      RateUtility.calculateHierarchy(steps);
      expect(RateUtility.sortRecursive).toHaveBeenCalledWith(
        {
          ['2']: [steps[0]],
          ['']: [steps[1], steps[2]],
        },
        '',
        []
      );
    });

    it('should handle steps not connected to root', () => {
      const steps: Step[] = [
        {
          id: 'id',
          itemId: ItemId.Coal,
          recipeId: RecipeId.Coal,
          items: Rational.one,
          parents: { [RecipeId.PlasticBar]: Rational.one },
        },
        {
          id: 'id',
          itemId: ItemId.PlasticBar,
          recipeId: RecipeId.PlasticBar,
          items: Rational.one,
          parents: { [RecipeId.Coal]: Rational.one },
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
          items: Rational.one,
          parents: { [RecipeId.PlasticBar]: Rational.one },
        },
        {
          id: `${ItemId.IronOre}.${RecipeId.IronOre}`,
          itemId: ItemId.IronOre,
          recipeId: RecipeId.IronOre,
          items: Rational.one,
          parents: {
            [RecipeId.CopperCable]: Rational.one,
            [RecipeId.WoodenChest]: Rational.one,
          },
        },
        {
          id: `${ItemId.PlasticBar}.${RecipeId.PlasticBar}`,
          itemId: ItemId.PlasticBar,
          recipeId: RecipeId.PlasticBar,
          items: Rational.one,
        },
      ];
      const result = RateUtility.sortRecursive(
        {
          [`${ItemId.PlasticBar}.${RecipeId.PlasticBar}`]: [steps[0]],
          ['']: [steps[1], steps[2]],
        },
        '',
        []
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
          items: Rational.one,
        },
        {
          id: 'id',
          itemId: ItemId.Coal,
          items: Rational.one,
          parents: {
            [RecipeId.IronOre]: Rational.one,
          },
        },
      ];
      const result = RateUtility.copy(steps);
      steps[1].parents![RecipeId.CrudeOil] = Rational.one;
      expect(result[1].parents?.[RecipeId.CrudeOil]).toBeUndefined();
    });
  });
});

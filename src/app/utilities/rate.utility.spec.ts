import { Mocks, CategoryId, ItemId, RecipeId } from 'src/tests';
import { RateUtility } from './rate.utility';
import { Step, Rational, DisplayRate } from '~/models';

describe('RateUtility', () => {
  describe('addStepsFor', () => {
    const expected = [
      {
        itemId: 'iron-chest',
        recipeId: 'iron-chest',
        items: new Rational(BigInt(30)),
        factories: new Rational(BigInt(20)),
        power: new Rational(BigInt(3100)),
        pollution: new Rational(BigInt(1)),
      },
      {
        itemId: 'iron-plate',
        recipeId: 'iron-plate',
        items: new Rational(BigInt(240)),
        factories: new Rational(BigInt(1024)),
        power: new Rational(BigInt(158720)),
        pollution: new Rational(BigInt(256), BigInt(5)),
        parents: { 'iron-chest': new Rational(BigInt(240)) },
      },
      {
        itemId: 'iron-ore',
        recipeId: 'iron-ore',
        items: new Rational(BigInt(240)),
        factories: new Rational(BigInt(320)),
        power: new Rational(BigInt(49600)),
        pollution: new Rational(BigInt(16)),
        parents: { 'iron-plate': new Rational(BigInt(240)) },
      },
    ];

    it('should recursively calculate required steps', () => {
      const steps: Step[] = [];
      RateUtility.addStepsFor(
        Mocks.Item2.id,
        new Rational(BigInt(30)),
        steps,
        Mocks.ItemSettingsEntities,
        Mocks.AdjustedData
      );
      expect(steps as any).toEqual(expected as any);
    });

    it('should handle repeated products', () => {
      const steps: Step[] = [];
      RateUtility.addStepsFor(
        Mocks.Item2.id,
        new Rational(BigInt(15)),
        steps,
        Mocks.ItemSettingsEntities,
        Mocks.AdjustedData
      );
      RateUtility.addStepsFor(
        Mocks.Item2.id,
        new Rational(BigInt(15)),
        steps,
        Mocks.ItemSettingsEntities,
        Mocks.AdjustedData
      );
      expect(steps).toEqual(expected as any);
    });

    it('should handle research recipes', () => {
      const steps: Step[] = [];
      RateUtility.addStepsFor(
        Mocks.Item2.id,
        new Rational(BigInt(30)),
        steps,
        Mocks.ItemSettingsEntities,
        {
          ...Mocks.AdjustedData,
          ...{
            itemR: {
              ...Mocks.AdjustedData.itemR,
              ...{
                ['iron-chest']: {
                  ...Mocks.AdjustedData.itemR['iron-chest'],
                  ...{ category: CategoryId.Research },
                } as any,
              },
            },
          },
        }
      );
      expect(steps).toEqual(expected as any);
    });

    it('should adjust for consumption instead of production for research recipes', () => {
      const steps: Step[] = [];
      Mocks.AdjustedData.recipeR[Mocks.Item2.id].adjustProd = Rational.one;
      RateUtility.addStepsFor(
        Mocks.Item2.id,
        new Rational(BigInt(30)),
        steps,
        Mocks.ItemSettingsEntities,
        Mocks.AdjustedData
      );
      delete Mocks.AdjustedData.recipeR[Mocks.Item2.id].adjustProd;
      expect(steps as any).toEqual(expected as any);
    });

    it('should handle null recipe', () => {
      const steps: Step[] = [];
      RateUtility.addStepsFor(
        ItemId.Uranium235,
        new Rational(BigInt(30)),
        steps,
        Mocks.ItemSettingsEntities,
        Mocks.AdjustedData
      );
      expect(steps).toEqual([
        {
          itemId: ItemId.Uranium235,
          recipeId: null,
          items: new Rational(BigInt(30)),
          factories: Rational.zero,
        },
      ]);
    });

    it('should handle recipe that does not produce the item', () => {
      const steps: Step[] = [];
      spyOn(
        Mocks.AdjustedData.recipeR[RecipeId.Coal],
        'produces'
      ).and.returnValue(false);
      RateUtility.addStepsFor(
        ItemId.Coal,
        Rational.one,
        steps,
        Mocks.ItemSettingsEntities,
        Mocks.AdjustedData
      );
      expect(steps).toEqual([
        {
          itemId: ItemId.Coal,
          recipeId: null,
          items: Rational.one,
          factories: Rational.zero,
        },
      ]);
    });
  });

  describe('addParentValue', () => {
    it('should handle null parent', () => {
      const step = { ...Mocks.Step1 };
      RateUtility.addParentValue(step, null, null);
      expect(step).toEqual(Mocks.Step1);
    });

    it('should add parents field to step', () => {
      const step = { ...Mocks.Step1 };
      RateUtility.addParentValue(step, ItemId.Coal, Rational.one);
      expect(step.parents).toEqual({ [ItemId.Coal]: Rational.one });
    });

    it('should add to existing parents object', () => {
      const step = {
        ...Mocks.Step1,
        ...{ parents: { [ItemId.Coal]: Rational.zero } },
      };
      RateUtility.addParentValue(step, ItemId.Coal, Rational.one);
      expect(step.parents).toEqual({ [ItemId.Coal]: Rational.one });
    });
  });

  describe('adjustPowerPollution', () => {
    it('should handle no factories', () => {
      const step: any = { factories: null };
      const result = { ...step };
      RateUtility.adjustPowerPollution(result, null);
      expect(result).toEqual(step);
    });

    it('should handle null power/pollution', () => {
      const step: any = { factories: Rational.one };
      const result = { ...step };
      const recipe: any = { power: null, pollution: null };
      RateUtility.adjustPowerPollution(result, recipe);
      expect(result).toEqual(step);
    });

    it('should calculate power/pollution', () => {
      const step: any = { factories: Rational.two };
      const recipe: any = {
        consumption: new Rational(BigInt(3)),
        pollution: new Rational(BigInt(4)),
      };
      RateUtility.adjustPowerPollution(step, recipe);
      expect(step).toEqual({
        factories: Rational.two,
        power: new Rational(BigInt(6)),
        pollution: new Rational(BigInt(8)),
      });
    });
  });

  describe('calculateBelts', () => {
    it('should skip steps with no settings', () => {
      const steps: Step[] = [
        {
          itemId: null,
          recipeId: null,
          items: null,
          belts: null,
        },
      ];
      const result = RateUtility.calculateBelts(
        steps,
        Mocks.ItemSettingsEntities,
        Mocks.BeltSpeed,
        Mocks.AdjustedData
      );
      expect(result[0].belts).toBeNull();
    });

    it('should skip steps with no items', () => {
      const steps: Step[] = [
        {
          itemId: Mocks.Item1.id,
          recipeId: null,
          items: null,
          belts: null,
        },
      ];
      const result = RateUtility.calculateBelts(
        steps,
        Mocks.ItemSettingsEntities,
        Mocks.BeltSpeed,
        Mocks.AdjustedData
      );
      expect(result[0].belts).toBeNull();
    });

    it('should calculate required belts & wagons for steps', () => {
      const steps: Step[] = [
        {
          itemId: Mocks.Item1.id,
          recipeId: null,
          items: Mocks.BeltSpeed[ItemId.TransportBelt],
          belts: Rational.zero,
        },
      ];
      const result = RateUtility.calculateBelts(
        steps,
        Mocks.ItemSettingsEntities,
        Mocks.BeltSpeed,
        Mocks.AdjustedData
      );
      expect(result[0].belts).toEqual(Rational.one);
      expect(result[0].wagons).toEqual(new Rational(BigInt(3), BigInt(400)));
    });

    it('should calculate required wagons for fluids', () => {
      const steps: Step[] = [
        {
          itemId: ItemId.CrudeOil,
          recipeId: null,
          items: Rational.from(25000),
          belts: Rational.zero,
        },
      ];
      const result = RateUtility.calculateBelts(
        steps,
        Mocks.ItemSettingsInitial,
        Mocks.BeltSpeed,
        Mocks.AdjustedData
      );
      expect(result[0].wagons).toEqual(Rational.one);
    });
  });

  describe('calculateOutputs', () => {
    it('should ignore steps with no recipe', () => {
      const result = RateUtility.calculateOutputs(
        [{ itemId: ItemId.Coal, items: Rational.one }],
        Mocks.AdjustedData
      );
      expect(result[0].outputs).toBeUndefined();
    });

    it('should calculate step output percentages', () => {
      const result = RateUtility.calculateOutputs(
        [
          {
            itemId: ItemId.Coal,
            items: Rational.one,
            factories: Rational.two,
            recipeId: RecipeId.Coal,
          },
        ],
        Mocks.AdjustedData
      );
      expect(result[0].outputs).toEqual({ [ItemId.Coal]: Rational.from(3, 2) });
    });
  });

  describe('displayRate', () => {
    it('should skip steps with no items', () => {
      const steps: Step[] = [
        {
          itemId: Mocks.Item1.id,
          recipeId: null,
          items: null,
          belts: null,
        },
      ];
      RateUtility.displayRate(steps, 3 as any);
      expect(steps[0].items).toBeNull();
    });

    it('should apply the display rate to the given steps', () => {
      const result = RateUtility.displayRate(
        [
          {
            items: Rational.one,
            surplus: Rational.two,
            wagons: new Rational(BigInt(3)),
            pollution: new Rational(BigInt(4)),
          },
        ] as any,
        DisplayRate.PerMinute
      );
      expect(result[0].items).toEqual(new Rational(BigInt(60)));
      expect(result[0].surplus).toEqual(new Rational(BigInt(120)));
      expect(result[0].wagons).toEqual(new Rational(BigInt(180)));
      expect(result[0].pollution).toEqual(new Rational(BigInt(240)));
    });

    it('should apply the display rate to partial steps', () => {
      const result = RateUtility.displayRate(
        [{ items: Rational.two }] as any,
        DisplayRate.PerMinute
      );
      expect(result[0].items).toEqual(new Rational(BigInt(120)));
      expect(result[0].surplus).toBeUndefined();
      expect(result[0].wagons).toBeUndefined();
      expect(result[0].pollution).toBeUndefined();
    });

    it('should calculate parent percentages', () => {
      const result = RateUtility.displayRate(
        [{ items: Rational.two, parents: { id: Rational.one } }] as any,
        DisplayRate.PerMinute
      );
      expect(result[0].parents.id).toEqual(new Rational(BigInt(1), BigInt(2)));
    });
  });

  describe('copy', () => {
    it('should create a copy of steps', () => {
      const steps: Step[] = [
        {
          itemId: ItemId.Coal,
          items: Rational.one,
        },
        {
          itemId: ItemId.Coal,
          items: Rational.one,
          parents: {
            [RecipeId.IronOre]: Rational.one,
          },
        },
      ];
      const result = RateUtility.copy(steps);
      steps[1].parents[RecipeId.CrudeOil] = Rational.one;
      expect(result[1].parents[RecipeId.CrudeOil]).toBeUndefined();
    });
  });
});

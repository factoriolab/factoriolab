import { Mocks, CategoryId, ItemId, RecipeId } from 'src/tests';
import { RateUtility } from './rate.utility';
import {
  Step,
  Rational,
  DisplayRate,
  RationalRecipe,
  Entities,
  RationalRecipeSettings,
} from '~/models';

xdescribe('RateUtility', () => {
  describe('addStepsFor', () => {
    const expected: Step[] = [
      {
        id: 'id',
        itemId: 'iron-chest',
        recipeId: 'iron-chest',
        items: Rational.from(30),
        factories: Rational.from(12, 7),
        power: Rational.from(42475, 7),
        pollution: Rational.from(94, 175),
      },
      {
        id: 'id',
        itemId: 'iron-plate',
        recipeId: 'iron-plate',
        items: Rational.from(240),
        factories: Rational.from(3200, 47),
        power: Rational.from(4742658, 47),
        pollution: Rational.from(2624, 235),
        parents: { 'iron-chest': Rational.from(240) },
      },
      {
        id: 'id',
        itemId: 'iron-ore',
        recipeId: 'iron-ore',
        items: Rational.from(200),
        factories: Rational.from(80000, 1183),
        power: Rational.from(64800000, 1183),
        pollution: Rational.from(12000, 91),
        parents: { 'iron-plate': Rational.from(200) },
      },
    ];

    it('should recursively calculate required steps', () => {
      const steps: Step[] = [];
      RateUtility.addStepsFor(
        Mocks.Item2.id,
        Rational.from(30),
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
        Rational.from(15),
        steps,
        Mocks.ItemSettingsEntities,
        Mocks.AdjustedData
      );
      RateUtility.addStepsFor(
        Mocks.Item2.id,
        Rational.from(15),
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
        Rational.from(30),
        steps,
        Mocks.ItemSettingsEntities,
        {
          ...Mocks.AdjustedData,
          ...{
            itemEntities: {
              ...Mocks.AdjustedData.itemEntities,
              ...{
                ['iron-chest']: {
                  ...Mocks.AdjustedData.itemEntities['iron-chest'],
                  ...{ category: CategoryId.Research },
                } as any,
              },
            },
          },
        }
      );
      expect(steps).toEqual(expected as any);
    });

    // it('should adjust for consumption instead of production for research recipes', () => {
    //   const steps: Step[] = [];
    //   const data = {
    //     ...Mocks.AdjustedData,
    //     ...{
    //       recipeR: {
    //         ...Mocks.AdjustedData.recipeR,
    //         ...{
    //           [Mocks.Item2.id]: {
    //             ...Mocks.AdjustedData.recipeR[Mocks.Item2.id],
    //             ...{
    //               adjustProd: true,
    //               productivity: Rational.one,
    //             },
    //           },
    //         },
    //       },
    //     },
    //   };
    //   RateUtility.addStepsFor(
    //     Mocks.Item2.id,
    //     Rational.from(30),
    //     steps,
    //     Mocks.ItemSettingsEntities,
    //     data
    //   );
    //   expect(steps as any).toEqual(expected as any);
    // });

    it('should handle null recipe', () => {
      const steps: Step[] = [];
      RateUtility.addStepsFor(
        ItemId.Uranium235,
        Rational.from(30),
        steps,
        Mocks.ItemSettingsEntities,
        Mocks.AdjustedData
      );
      expect(steps).toEqual([
        {
          id: '0',
          itemId: ItemId.Uranium235,
          items: new Rational(BigInt(30)),
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
          id: 'id',
          itemId: ItemId.Coal,
          items: Rational.one,
        },
      ]);
    });

    it('should not assign a recipe to an ignored item', () => {
      const steps: Step[] = [];
      const itemSettings = {
        ...Mocks.ItemSettingsEntities,
        ...{
          [Mocks.Item2.id]: {
            ...Mocks.ItemSettingsEntities[Mocks.Item2.id],
            ...{ ignore: true },
          },
        },
      };
      RateUtility.addStepsFor(
        Mocks.Item2.id,
        Rational.from(30),
        steps,
        itemSettings,
        Mocks.AdjustedData
      );
      expect(steps).toEqual([
        {
          id: 'id',
          itemId: Mocks.Item2.id,
          items: Rational.from(30),
        },
      ]);
    });

    it('should assign parents for circular recipes', () => {
      const steps: Step[] = [];
      const recipe = new RationalRecipe({
        ...Mocks.AdjustedData.recipeEntities[RecipeId.Coal],
        ...{ in: { [ItemId.Coal]: 0.1 }, out: { [ItemId.Coal]: 1 } },
      });
      RateUtility.addStepsFor(
        ItemId.Coal,
        Rational.one,
        steps,
        Mocks.ItemSettingsEntities,
        {
          ...Mocks.AdjustedData,
          ...{
            recipeR: {
              ...Mocks.AdjustedData.recipeR,
              ...{
                [RecipeId.Coal]: recipe,
              },
            },
          },
        }
      );
      expect(steps).toEqual([
        {
          id: 'id',
          itemId: ItemId.Coal,
          items: Rational.one,
          recipeId: RecipeId.Coal,
          factories: Rational.from(10, 9),
          parents: { [RecipeId.Coal]: Rational.from(1, 9) },
        },
      ]);
    });
  });

  describe('addParentValue', () => {
    it('should handle null parent', () => {
      const step = { ...Mocks.Step1 };
      RateUtility.addParentValue(step, 'parentId', Rational.one);
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
      RateUtility.adjustPowerPollution(
        result,
        Mocks.AdjustedData.recipeR[RecipeId.WoodenChest]
      );
      expect(result).toEqual(step);
    });

    it('should handle null drain/consumption/pollution', () => {
      const step: any = { factories: Rational.one };
      const result = { ...step };
      const recipe: any = { drain: null, consumption: null, pollution: null };
      RateUtility.adjustPowerPollution(result, recipe);
      expect(result).toEqual(step);
    });

    it('should handle only drain', () => {
      const step: any = { factories: Rational.one };
      const result = { ...step };
      const recipe: any = {
        drain: Rational.two,
        consumption: null,
        pollution: null,
      };
      RateUtility.adjustPowerPollution(result, recipe);
      expect(result).toEqual({
        factories: Rational.one,
        power: Rational.two,
      });
    });

    it('should handle only consumption', () => {
      const step: any = { factories: Rational.one };
      const result = { ...step };
      const recipe: any = {
        drain: null,
        consumption: Rational.two,
        pollution: null,
      };
      RateUtility.adjustPowerPollution(result, recipe);
      expect(result).toEqual({
        factories: Rational.one,
        power: Rational.two,
      });
    });

    it('should calculate power/pollution', () => {
      const step: any = { factories: Rational.from(3, 2) };
      const recipe: any = {
        drain: Rational.from(3),
        consumption: Rational.from(4),
        pollution: Rational.from(5),
      };
      RateUtility.adjustPowerPollution(step, recipe);
      expect(step).toEqual({
        factories: Rational.from(3, 2),
        power: Rational.from(12),
        pollution: Rational.from(15, 2),
      });
    });
  });

  describe('calculateBelts', () => {
    it('should skip steps with no settings', () => {
      const steps: Step[] = [
        {
          id: 'id',
        },
      ];
      const result = RateUtility.calculateBelts(
        steps,
        Mocks.ItemSettingsInitial,
        Mocks.RecipeSettingsInitial,
        Mocks.BeltSpeed,
        Mocks.AdjustedData
      );
      expect(result[0].belts).toBeNull();
    });

    it('should skip steps with no items', () => {
      const steps: Step[] = [
        {
          id: 'id',
          itemId: Mocks.Item1.id,
        },
      ];
      const result = RateUtility.calculateBelts(
        steps,
        Mocks.ItemSettingsInitial,
        Mocks.RecipeSettingsInitial,
        Mocks.BeltSpeed,
        Mocks.AdjustedData
      );
      expect(result[0].belts).toBeNull();
    });

    it('should calculate required belts & wagons for steps', () => {
      const steps: Step[] = [
        {
          id: 'id',
          itemId: Mocks.Item1.id,
          items: Mocks.BeltSpeed[ItemId.TransportBelt],
          belts: Rational.zero,
        },
      ];
      const result = RateUtility.calculateBelts(
        steps,
        Mocks.ItemSettingsInitial,
        Mocks.RecipeSettingsInitial,
        Mocks.BeltSpeed,
        Mocks.AdjustedData
      );
      expect(result[0].belts).toEqual(Rational.one);
      expect(result[0].wagons).toEqual(new Rational(BigInt(3), BigInt(400)));
    });

    it('should calculate required wagons for fluids', () => {
      const steps: Step[] = [
        {
          id: 'id',
          itemId: ItemId.CrudeOil,
          items: Rational.from(25000),
          belts: Rational.zero,
        },
      ];
      const result = RateUtility.calculateBelts(
        steps,
        Mocks.ItemSettingsInitial,
        Mocks.RecipeSettingsInitial,
        Mocks.BeltSpeed,
        Mocks.AdjustedData
      );
      expect(result[0].wagons).toEqual(Rational.one);
    });

    it('should set to null for research recipes', () => {
      const steps: Step[] = [
        {
          id: 'id',
          itemId: ItemId.ArtilleryShellRange,
          recipeId: RecipeId.ArtilleryShellRange,
          items: Rational.one,
          belts: Rational.one,
          wagons: Rational.one,
        },
      ];
      const result = RateUtility.calculateBelts(
        steps,
        Mocks.ItemSettingsInitial,
        Mocks.RecipeSettingsInitial,
        Mocks.BeltSpeed,
        Mocks.AdjustedData
      );
      expect(result[0].belts).toBeNull();
      expect(result[0].wagons).toBeNull();
    });

    it('should set to null for rocket part recipes', () => {
      const steps: Step[] = [
        {
          id: 'id',
          itemId: ItemId.RocketPart,
          recipeId: RecipeId.RocketPart,
          items: Rational.one,
          belts: Rational.one,
          wagons: Rational.one,
        },
      ];
      const result = RateUtility.calculateBelts(
        steps,
        Mocks.ItemSettingsInitial,
        Mocks.RecipeSettingsInitial,
        Mocks.BeltSpeed,
        Mocks.AdjustedData
      );
      expect(result[0].belts).toBeNull();
      expect(result[0].wagons).toBeNull();
    });
  });

  describe('calculateOutputs', () => {
    it('should ignore steps with no recipe', () => {
      const result = RateUtility.calculateOutputs(
        [
          {
            id: 'id',
            itemId: ItemId.Coal,
            items: Rational.one,
          },
        ],
        Mocks.AdjustedData
      );
      expect(result[0].outputs).toBeUndefined();
    });

    it('should calculate step output percentages', () => {
      const result = RateUtility.calculateOutputs(
        [
          {
            id: 'id',
            itemId: ItemId.Coal,
            items: Rational.one,
            factories: Rational.two,
            recipeId: RecipeId.Coal,
          },
        ],
        Mocks.AdjustedData
      );
      expect(result[0].outputs).toEqual({
        [ItemId.Coal]: Rational.from(1183, 200),
      });
    });
  });

  describe('calculateBeacons', () => {
    it('should skip if beacon receivers is null or zero', () => {
      expect(
        RateUtility.calculateBeacons([], undefined, {}, Mocks.AdjustedData)
      ).toBeNull();
      expect(
        RateUtility.calculateBeacons([], Rational.zero, {}, Mocks.AdjustedData)
      ).toBeNull();
    });

    it('should ignore steps with no factories or beacons', () => {
      const settings: Entities<RationalRecipeSettings> = {
        [RecipeId.Coal]: { beaconCount: Rational.zero },
        [RecipeId.IronOre]: {},
      };
      const steps = [
        {},
        { factories: Rational.zero },
        { factories: Rational.one, recipeId: RecipeId.Coal },
        { factories: Rational.one, recipeId: RecipeId.IronOre },
      ] as any;
      expect(
        RateUtility.calculateBeacons(
          steps,
          Rational.one,
          settings,
          Mocks.AdjustedData
        )
      ).toEqual(steps);
    });

    it('should calculate the number of beacons', () => {
      const steps: Step[] = [
        {
          id: 'id',
          itemId: ItemId.Coal,
          items: Rational.one,
          recipeId: RecipeId.Coal,
          factories: Rational.one,
          power: Rational.zero,
        },
      ];
      RateUtility.calculateBeacons(
        steps,
        Rational.one,
        Mocks.RationalRecipeSettingsInitial,
        Mocks.AdjustedData
      );
      expect(steps[0].beacons).toEqual(Rational.from(8));
      expect(steps[0].power).toEqual(Rational.from(3840));
    });

    it('should override from recipe settings', () => {
      const settings: Entities<RationalRecipeSettings> = {
        [RecipeId.Coal]: {
          beaconCount: Rational.from(8),
          beacon: ItemId.Beacon,
          beaconTotal: Rational.one,
        },
      };
      const steps: Step[] = [
        {
          id: 'id',
          itemId: ItemId.Coal,
          items: Rational.one,
          recipeId: RecipeId.Coal,
          factories: Rational.one,
          power: Rational.zero,
        },
      ];
      RateUtility.calculateBeacons(
        steps,
        Rational.one,
        settings,
        Mocks.AdjustedData
      );
      expect(steps[0].beacons).toEqual(Rational.one);
      expect(steps[0].power).toEqual(Rational.from(480));
    });
  });

  describe('displayRate', () => {
    it('should skip steps with no items', () => {
      const steps: Step[] = [
        {
          id: 'id',
          itemId: Mocks.Item1.id,
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
            wagons: Rational.from(3),
            pollution: Rational.from(4),
          },
        ] as any,
        DisplayRate.PerMinute
      );
      expect(result[0].items).toEqual(Rational.from(60));
      expect(result[0].surplus).toEqual(Rational.from(120));
      expect(result[0].wagons).toEqual(Rational.from(180));
      expect(result[0].pollution).toEqual(Rational.from(240));
    });

    it('should apply the display rate to partial steps', () => {
      const result = RateUtility.displayRate(
        [{ items: Rational.two }] as any,
        DisplayRate.PerMinute
      );
      expect(result[0].items).toEqual(Rational.from(120));
      expect(result[0].surplus).toBeUndefined();
      expect(result[0].wagons).toBeUndefined();
      expect(result[0].pollution).toBeUndefined();
    });

    it('should calculate parent percentages', () => {
      const result = RateUtility.displayRate(
        [{ items: Rational.two, parents: { id: Rational.one } }] as any,
        DisplayRate.PerMinute
      );
      expect(result[0].parents?.['id']).toEqual(Rational.from(1, 2));
    });
  });

  describe('sortHierarchy', () => {
    it('should assign ids', () => {
      const steps: Step[] = [
        {
          id: 'id',
          itemId: ItemId.IronOre,
          items: Rational.one,
        },
        {
          id: 'id',
          recipeId: RecipeId.Coal,
          items: Rational.one,
        },
      ];
      const result = RateUtility.sortHierarchy(steps);
      expect(result[0].id).toEqual(`${ItemId.IronOre}.`);
      expect(result[1].id).toEqual(`.${RecipeId.Coal}`);
    });

    it('should set up groups by parents', () => {
      spyOn(RateUtility, 'sortRecursive').and.returnValue([]);
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
          itemId: ItemId.IronOre,
          recipeId: RecipeId.IronOre,
          items: Rational.one,
          parents: {
            [RecipeId.CopperCable]: Rational.one,
            [RecipeId.WoodenChest]: Rational.one,
          },
        },
        {
          id: 'id',
          itemId: ItemId.PlasticBar,
          recipeId: RecipeId.PlasticBar,
          items: Rational.one,
        },
      ];
      RateUtility.sortHierarchy(steps);
      expect(RateUtility.sortRecursive).toHaveBeenCalledWith(
        {
          [`${ItemId.PlasticBar}.${RecipeId.PlasticBar}`]: [steps[0]],
          ['']: [steps[1], steps[2]],
        },
        '',
        []
      );
    });

    it('should put self-parented steps at root', () => {
      spyOn(RateUtility, 'sortRecursive').and.returnValue([]);
      const steps: Step[] = [
        {
          id: 'id',
          itemId: ItemId.Coal,
          recipeId: RecipeId.Coal,
          items: Rational.one,
          parents: { [RecipeId.Coal]: Rational.one },
        },
      ];
      RateUtility.sortHierarchy(steps);
      expect(RateUtility.sortRecursive).toHaveBeenCalledWith(
        { ['']: [steps[0]] },
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
      const sorted = RateUtility.sortHierarchy(steps);
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

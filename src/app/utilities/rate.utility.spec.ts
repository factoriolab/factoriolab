import { Mocks, CategoryId, ItemId } from 'src/tests';
import { RateUtility } from './rate.utility';
import { Step, Node, Rational, DisplayRate } from '~/models';

describe('RateUtility', () => {
  describe('addStepsFor', () => {
    const expected = [
      {
        depth: 0,
        itemId: 'iron-chest',
        recipeId: 'iron-chest',
        items: new Rational(BigInt(30)),
        factories: new Rational(BigInt(20)),
        consumption: new Rational(BigInt(3100)),
        pollution: new Rational(BigInt(60)),
      },
      {
        depth: 1,
        itemId: 'iron-plate',
        recipeId: 'iron-plate',
        items: new Rational(BigInt(240)),
        factories: new Rational(BigInt(1024)),
        consumption: new Rational(BigInt(158720)),
        pollution: new Rational(BigInt(3072)),
        parents: { 'iron-chest': new Rational(BigInt(240)) },
      },
      {
        depth: 2,
        itemId: 'iron-ore',
        recipeId: 'iron-ore',
        items: new Rational(BigInt(240)),
        factories: new Rational(BigInt(320)),
        consumption: new Rational(BigInt(49600)),
        pollution: new Rational(BigInt(960)),
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
        Mocks.RecipeSettingsEntities,
        ItemId.Coal,
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
        Mocks.RecipeSettingsEntities,
        ItemId.Coal,
        Mocks.AdjustedData
      );
      RateUtility.addStepsFor(
        Mocks.Item2.id,
        new Rational(BigInt(15)),
        steps,
        Mocks.ItemSettingsEntities,
        Mocks.RecipeSettingsEntities,
        ItemId.Coal,
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
        Mocks.RecipeSettingsEntities,
        ItemId.Coal,
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

    it('should properly calculate factories for space science pack/rocket parts', () => {
      const steps: Step[] = [];
      RateUtility.addStepsFor(
        ItemId.SpaceSciencePack,
        new Rational(BigInt(60)),
        steps,
        Mocks.ItemSettingsEntities,
        Mocks.RecipeSettingsEntities,
        ItemId.Coal,
        Mocks.AdjustedData
      );
      expect(steps[0].factories).toBe(null);
      expect(steps[1].factories).toEqual(
        new Rational(BigInt(1321), BigInt(50))
      );
    });

    it('should adjust for consumption instead of production for research recipes', () => {
      const steps: Step[] = [];
      const data = {
        ...Mocks.AdjustedData,
        ...{
          recipeR: {
            ...Mocks.AdjustedData.recipeR,
            ...{
              [Mocks.Item2.id]: {
                ...Mocks.AdjustedData.recipeR[Mocks.Item2.id],
                ...{ adjustProd: Rational.one },
              },
            },
          },
        },
      };
      RateUtility.addStepsFor(
        Mocks.Item2.id,
        new Rational(BigInt(30)),
        steps,
        Mocks.ItemSettingsEntities,
        Mocks.RecipeSettingsEntities,
        ItemId.Coal,
        data
      );
      expect(steps as any).toEqual(expected as any);
    });

    it('should handle null recipe', () => {
      const steps: Step[] = [];
      RateUtility.addStepsFor(
        ItemId.Uranium235,
        new Rational(BigInt(30)),
        steps,
        Mocks.ItemSettingsEntities,
        Mocks.RecipeSettingsEntities,
        ItemId.Coal,
        Mocks.AdjustedData
      );
      expect(steps).toEqual([
        {
          depth: 0,
          itemId: ItemId.Uranium235,
          recipeId: null,
          items: new Rational(BigInt(30)),
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

  describe('addNodesFor', () => {
    const expected: any = {
      id: 'root',
      children: [
        {
          id: 'root:iron-chest',
          name: 'Iron chest',
          itemId: 'iron-chest',
          recipeId: 'iron-chest',
          items: new Rational(BigInt(30)),
          factories: new Rational(BigInt(20)),
          consumption: new Rational(BigInt(3100)),
          pollution: new Rational(BigInt(60)),
          children: [
            {
              id: 'root:iron-chest:iron-plate',
              name: 'Iron plate',
              itemId: 'iron-plate',
              recipeId: 'iron-plate',
              items: new Rational(BigInt(240)),
              factories: new Rational(BigInt(1024)),
              consumption: new Rational(BigInt(158720)),
              pollution: new Rational(BigInt(3072)),
              children: [
                {
                  id: 'root:iron-chest:iron-plate:iron-ore',
                  name: 'Iron ore',
                  itemId: 'iron-ore',
                  recipeId: 'iron-ore',
                  items: new Rational(BigInt(240)),
                  factories: new Rational(BigInt(320)),
                  consumption: new Rational(BigInt(49600)),
                  pollution: new Rational(BigInt(960)),
                },
              ],
            },
          ],
        },
      ],
    };

    it('should recursively calculate required nodes', () => {
      const root: any = { id: 'root', children: [] };
      RateUtility.addNodesFor(
        root,
        Mocks.Item2.id,
        new Rational(BigInt(30)),
        Mocks.ItemSettingsEntities,
        Mocks.RecipeSettingsEntities,
        ItemId.Coal,
        Mocks.AdjustedData
      );
      expect(root).toEqual(expected);
    });

    it('should handle research recipes', () => {
      const root: any = { id: 'root', children: [] };
      RateUtility.addNodesFor(
        root,
        Mocks.Item2.id,
        new Rational(BigInt(30)),
        Mocks.ItemSettingsEntities,
        Mocks.RecipeSettingsEntities,
        ItemId.Coal,
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
      expect(root).toEqual(expected);
    });

    it('should properly calculate factories for space science pack/rocket parts', () => {
      const root: any = { id: 'root', children: [] };
      RateUtility.addNodesFor(
        root,
        ItemId.SpaceSciencePack,
        new Rational(BigInt(60)),
        Mocks.ItemSettingsEntities,
        Mocks.RecipeSettingsEntities,
        ItemId.Coal,
        Mocks.AdjustedData
      );
      expect(root.children[0].factories).toBe(null);
      expect(root.children[0].children[0].factories).toEqual(
        new Rational(BigInt(1321), BigInt(50))
      );
    });

    it('should handle null recipe', () => {
      const root: any = { id: 'root', children: [] };
      RateUtility.addNodesFor(
        root,
        ItemId.Uranium235,
        new Rational(BigInt(30)),
        Mocks.ItemSettingsEntities,
        Mocks.RecipeSettingsEntities,
        ItemId.Coal,
        Mocks.AdjustedData
      );
      expect(root.children[0]).toEqual({
        id: 'root:uranium-235',
        name: 'Uranium-235',
        itemId: ItemId.Uranium235,
        recipeId: ItemId.Uranium235 as any,
        items: new Rational(BigInt(30)),
        factories: Rational.zero,
      });
    });

    it('should handle ignored steps', () => {
      const root: any = { id: 'root', children: [] };
      RateUtility.addNodesFor(
        root,
        ItemId.WoodenChest,
        Rational.hundred,
        {
          ...Mocks.ItemSettingsInitial,
          ...{
            [ItemId.WoodenChest]: {
              ...Mocks.ItemSettingsInitial[ItemId.WoodenChest],
              ...{ ignore: true },
            },
          },
        } as any,
        Mocks.RecipeSettingsEntities,
        ItemId.Coal,
        Mocks.AdjustedData
      );
      expect(root.children[0].children).toBeUndefined();
    });
  });

  describe('calculateBelts', () => {
    it('should skip steps with no settings', () => {
      const steps: Step[] = [
        {
          depth: 0,
          itemId: null,
          recipeId: null,
          items: null,
          belts: null,
        },
      ];
      const result = RateUtility.calculateBelts(
        steps,
        Mocks.ItemSettingsEntities,
        Mocks.BeltSpeed
      );
      expect(result[0].belts).toBeNull();
    });

    it('should skip steps with no items', () => {
      const steps: Step[] = [
        {
          depth: 0,
          itemId: Mocks.Item1.id,
          recipeId: null,
          items: null,
          belts: null,
        },
      ];
      const result = RateUtility.calculateBelts(
        steps,
        Mocks.ItemSettingsEntities,
        Mocks.BeltSpeed
      );
      expect(result[0].belts).toBeNull();
    });

    it('should calculate required belts for steps', () => {
      const steps: Step[] = [
        {
          depth: 0,
          itemId: Mocks.Item1.id,
          recipeId: null,
          items: Mocks.BeltSpeed[ItemId.TransportBelt],
          belts: Rational.zero,
        },
      ];
      const result = RateUtility.calculateBelts(
        steps,
        Mocks.ItemSettingsEntities,
        Mocks.BeltSpeed
      );
      expect(result[0].belts).toEqual(Rational.one);
    });
  });

  describe('calculateNodeBelts', () => {
    it('should skip nodes with no items', () => {
      const node: Node = {
        id: 'test',
        name: 'test',
        itemId: Mocks.Item1.id,
        recipeId: null,
        items: null,
        belts: null,
      };
      const result = RateUtility.calculateNodeBelts(
        node,
        Mocks.ItemSettingsEntities,
        Mocks.BeltSpeed
      );
      expect(result.belts).toBeNull();
    });

    it('should calculate required belts for nodes', () => {
      const node: Node = {
        id: 'test',
        name: 'test',
        itemId: Mocks.Item1.id,
        recipeId: null,
        items: Mocks.BeltSpeed[ItemId.TransportBelt],
        belts: null,
        children: [
          {
            id: 'test2',
            name: 'test2',
            itemId: Mocks.Item1.id,
            recipeId: null,
            items: Mocks.BeltSpeed[ItemId.TransportBelt],
            belts: null,
          },
        ],
      };
      const result = RateUtility.calculateNodeBelts(
        node,
        Mocks.ItemSettingsEntities,
        Mocks.BeltSpeed
      );
      expect(result.belts).toEqual(Rational.one);
      expect(result.children[0].belts).toEqual(Rational.one);
    });
  });

  describe('displayRate', () => {
    it('should skip steps with no items', () => {
      const steps: Step[] = [
        {
          depth: 0,
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
        [{ items: Rational.two, surplus: new Rational(BigInt(3)) }] as any,
        DisplayRate.PerMinute
      );
      expect(result[0].items).toEqual(new Rational(BigInt(120)));
      expect(result[0].surplus).toEqual(new Rational(BigInt(180)));
    });

    it('should apply the display rate to the given steps with no surplus', () => {
      const result = RateUtility.displayRate(
        [{ items: Rational.two }] as any,
        DisplayRate.PerMinute
      );
      expect(result[0].items).toEqual(new Rational(BigInt(120)));
      expect(result[0].surplus).toBeFalsy();
    });

    it('should calculate parent percentages', () => {
      const result = RateUtility.displayRate(
        [{ items: Rational.two, parents: { id: Rational.one } }] as any,
        DisplayRate.PerMinute
      );
      expect(result[0].parents.id).toEqual(new Rational(BigInt(1), BigInt(2)));
    });
  });

  describe('nodeDisplayRate', () => {
    it('should skip nodes with no items', () => {
      const node: Node = {
        id: 'test',
        name: 'test',
        itemId: Mocks.Item1.id,
        recipeId: null,
        items: null,
        belts: null,
      };
      RateUtility.nodeDisplayRate(node, DisplayRate.PerMinute);
      expect(node.items).toBeNull();
    });

    it('should apply the display rate to the given nodes', () => {
      const node: Node = {
        id: 'test',
        name: 'test',
        itemId: Mocks.Item1.id,
        recipeId: null,
        items: Rational.two,
        surplus: new Rational(BigInt(3)),
        belts: null,
        children: [
          {
            id: 'test2',
            name: 'test2',
            itemId: Mocks.Item1.id,
            recipeId: null,
            items: Rational.two,
            surplus: new Rational(BigInt(3)),
            belts: null,
          },
        ],
      };
      RateUtility.nodeDisplayRate(node, DisplayRate.PerMinute);
      expect(node.items).toEqual(new Rational(BigInt(120)));
      expect(node.surplus).toEqual(new Rational(BigInt(180)));
      expect(node.children[0].items).toEqual(new Rational(BigInt(120)));
      expect(node.children[0].surplus).toEqual(new Rational(BigInt(180)));
    });

    it('should apply the display rate to the given nodes with no surplus', () => {
      const node: Node = {
        id: 'test',
        name: 'test',
        itemId: Mocks.Item1.id,
        recipeId: null,
        items: Rational.two,
        belts: null,
      };
      RateUtility.nodeDisplayRate(node, DisplayRate.PerMinute);
      expect(node.items).toEqual(new Rational(BigInt(120)));
      expect(node.surplus).toBeFalsy();
    });
  });
});

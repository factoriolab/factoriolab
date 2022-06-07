import { ItemId, RecipeId } from 'src/tests';
import { Rational } from '../rational';
import { RationalRecipe } from './recipe';

describe('RationalRecipe', () => {
  describe('constructor', () => {
    it('should fill in all fields', () => {
      const result = new RationalRecipe({
        id: RecipeId.AdvancedOilProcessing,
        name: 'name',
        time: 1,
        in: {
          [ItemId.Coal]: 1,
        },
        out: {
          [ItemId.PetroleumGas]: 2,
        },
        cost: 100,
        usage: 10,
        producers: [ItemId.AssemblingMachine1],
      });
      expect(result.id).toEqual(RecipeId.AdvancedOilProcessing);
      expect(result.name).toEqual('name');
      expect(result.time).toEqual(Rational.one);
      expect(result.in[ItemId.Coal]).toEqual(Rational.one);
      expect(result.out[ItemId.PetroleumGas]).toEqual(Rational.two);
      expect(result.cost).toEqual(Rational.hundred);
      expect(result.producers).toEqual([ItemId.AssemblingMachine1]);
      expect(result.usage).toEqual(Rational.ten);
    });

    it('should ignore undefined fields', () => {
      const result = new RationalRecipe({
        id: RecipeId.AdvancedOilProcessing,
        name: 'name',
        time: 1,
        in: {},
        out: {},
        producers: [ItemId.AssemblingMachine1],
      });
      expect(result.id).toEqual(RecipeId.AdvancedOilProcessing);
      expect(result.name).toEqual('name');
      expect(result.time).toEqual(Rational.one);
      expect(result.producers).toEqual([ItemId.AssemblingMachine1]);
      expect(result.in).toEqual({});
      expect(result.out).toEqual({});
      expect(result.cost).toBeUndefined();
    });

    it('should handle string for usage', () => {
      const result = new RationalRecipe({
        id: RecipeId.AdvancedOilProcessing,
        name: 'name',
        time: 1,
        usage: '60/30',
        in: {},
        out: {},
        producers: [ItemId.AssemblingMachine1],
      });
      expect(result.usage).toEqual(Rational.two);
    });
  });

  describe('produces', () => {
    const id = 'id';

    it('should handle a recipe that contains the item as input and output', () => {
      const recipe = new RationalRecipe({
        time: 0,
        in: { [id]: 1 },
        out: { [id]: 2 },
      } as any);
      expect(recipe.produces(id)).toBeTrue();
    });

    it('should handle a recipe that contains other outputs', () => {
      const recipe = new RationalRecipe({
        time: 0,
        in: {},
        out: { ['test']: 2 },
      } as any);
      expect(recipe.produces(id)).toBeFalse();
    });

    it('should handle a recipe that does not match', () => {
      const recipe = new RationalRecipe({
        time: 0,
        in: {},
        out: {},
      } as any);
      expect(recipe.produces(id)).toBeFalse();
    });
  });

  describe('producesOnly', () => {
    const id = 'id';

    it('handle recipe with multiple outputs', () => {
      const recipe = new RationalRecipe({
        time: 0,
        in: {},
        out: { [id]: 1, ['other']: 1 },
      } as any);
      expect(recipe.producesOnly(id)).toBeFalse();
    });

    it('handle recipe with single output', () => {
      const recipe = new RationalRecipe({
        time: 0,
        in: {},
        out: { [id]: 1 },
      } as any);
      expect(recipe.producesOnly(id)).toBeTrue();
    });
  });

  describe('output', () => {
    const id = 'id';

    it('should handle null values', () => {
      const recipe = new RationalRecipe({
        id,
        name: 'name',
        time: 0,
        producers: [],
        in: {},
        out: {},
      });
      expect(recipe.output(id)).toEqual(Rational.zero);
    });

    it('should subtract input from output', () => {
      const recipe = new RationalRecipe({
        id,
        name: 'name',
        time: 0,
        in: { [id]: 1 },
        out: { [id]: 2 },
        producers: [],
      });
      expect(recipe.output(id)).toEqual(Rational.one);
    });
  });
});

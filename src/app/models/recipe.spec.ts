import { ItemId } from './item';
import { Rational } from './rational';
import { RationalRecipe, RecipeId } from './recipe';

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
        expensive: {
          time: 2,
          in: {
            [ItemId.Coal]: 2,
          },
        },
        producers: [ItemId.AssemblingMachine1],
      });
      expect(result.id).toEqual(RecipeId.AdvancedOilProcessing);
      expect(result.name).toEqual('name');
      expect(result.time).toEqual(Rational.one);
      expect(result.in[ItemId.Coal]).toEqual(Rational.one);
      expect(result.out[ItemId.PetroleumGas]).toEqual(Rational.two);
      expect(result.expensive.time).toEqual(Rational.two);
      expect(result.expensive.in[ItemId.Coal]).toEqual(Rational.two);
      expect(result.producers).toEqual([ItemId.AssemblingMachine1]);
    });

    it('should ignore undefined expensive fields', () => {
      const result = new RationalRecipe({
        id: RecipeId.AdvancedOilProcessing,
        name: 'name',
        time: 1,
        expensive: {
          time: 2,
        },
      });
      expect(result.id).toEqual(RecipeId.AdvancedOilProcessing);
      expect(result.name).toEqual('name');
      expect(result.time).toEqual(Rational.one);
      expect(result.in).toBeUndefined();
      expect(result.out).toBeUndefined();
      expect(result.expensive.time).toEqual(Rational.two);
      expect(result.expensive.in).toBeUndefined();
      expect(result.producers).toBeUndefined();
    });

    it('should ignore undefined fields', () => {
      const result = new RationalRecipe({
        id: RecipeId.AdvancedOilProcessing,
        name: 'name',
        time: 1,
      });
      expect(result.id).toEqual(RecipeId.AdvancedOilProcessing);
      expect(result.name).toEqual('name');
      expect(result.time).toEqual(Rational.one);
      expect(result.in).toBeUndefined();
      expect(result.out).toBeUndefined();
      expect(result.expensive).toBeUndefined();
      expect(result.producers).toBeUndefined();
    });
  });
});

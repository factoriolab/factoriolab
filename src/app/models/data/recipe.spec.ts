import { CategoryId, ItemId, RecipeId } from 'src/tests';
import { Rational } from '../rational';
import { RecipeRational } from './recipe';

describe('RecipeRational', () => {
  describe('constructor', () => {
    it('should fill in all fields', () => {
      const result = new RecipeRational({
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
        row: 0,
        category: CategoryId.Logistics,
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
      const result = new RecipeRational({
        id: RecipeId.AdvancedOilProcessing,
        name: 'name',
        time: 1,
        in: {},
        out: {},
        producers: [ItemId.AssemblingMachine1],
        row: 0,
        category: CategoryId.Logistics,
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
      const result = new RecipeRational({
        id: RecipeId.AdvancedOilProcessing,
        name: 'name',
        time: 1,
        usage: '60/30',
        in: {},
        out: {},
        producers: [ItemId.AssemblingMachine1],
        row: 0,
        category: CategoryId.Logistics,
      });
      expect(result.usage).toEqual(Rational.two);
    });
  });
});

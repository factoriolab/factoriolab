import { Mocks, RecipeId } from 'src/tests';
import { RationalProducer } from './producer';
import { Rational } from './rational';

describe('RationalProducer', () => {
  describe('constructor', () => {
    it('should fill in all fields', () => {
      const result = new RationalProducer(
        {
          id: '1',
          recipeId: RecipeId.IronPlate,
          count: '2',
        },
        Mocks.Dataset.recipeR[RecipeId.IronPlate]
      );
      expect(result.id).toEqual('1');
      expect(result.recipeId).toEqual(RecipeId.IronPlate);
      expect(result.count).toEqual(Rational.two);
    });

    it('should ignore undefined fields', () => {
      const result = new RationalProducer(
        {
          id: '1',
          recipeId: RecipeId.IronPlate,
          count: '2',
        },
        Mocks.Dataset.recipeR[RecipeId.IronPlate]
      );
      expect(result.id).toEqual('1');
      expect(result.recipeId).toEqual(RecipeId.IronPlate);
      expect(result.count).toEqual(Rational.two);
    });
  });
});

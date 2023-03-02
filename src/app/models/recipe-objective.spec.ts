import { Mocks, RecipeId } from 'src/tests';
import { Rational } from './rational';
import { RationalRecipeObjective } from './recipe-objective';

describe('RationalRecipeObjective', () => {
  describe('constructor', () => {
    it('should fill in all fields', () => {
      const result = new RationalRecipeObjective(
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
      const result = new RationalRecipeObjective(
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

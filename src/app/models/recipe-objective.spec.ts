import { Mocks, RecipeId } from 'src/tests';
import { ObjectiveType } from './enum';
import { Rational } from './rational';
import { RecipeObjectiveRational } from './recipe-objective';

describe('RecipeObjectiveRational', () => {
  describe('constructor', () => {
    it('should fill in all fields', () => {
      const result = new RecipeObjectiveRational(
        {
          id: '1',
          recipeId: RecipeId.IronPlate,
          count: '2',
          type: ObjectiveType.Output,
        },
        Mocks.Dataset.recipeR[RecipeId.IronPlate]
      );
      expect(result.id).toEqual('1');
      expect(result.recipeId).toEqual(RecipeId.IronPlate);
      expect(result.count).toEqual(Rational.two);
    });

    it('should ignore undefined fields', () => {
      const result = new RecipeObjectiveRational(
        {
          id: '1',
          recipeId: RecipeId.IronPlate,
          count: '2',
          type: ObjectiveType.Output,
        },
        Mocks.Dataset.recipeR[RecipeId.IronPlate]
      );
      expect(result.id).toEqual('1');
      expect(result.recipeId).toEqual(RecipeId.IronPlate);
      expect(result.count).toEqual(Rational.two);
    });
  });
});

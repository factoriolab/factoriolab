import { Mocks } from 'src/tests';
import { RecipeUtility } from '~/utilities';
import * as Selectors from './objectives.selectors';

describe('Recipe Objectives Selectors', () => {
  describe('Base selector functions', () => {
    it('should get slices of state', () => {
      expect(
        Selectors.recipeObjectivesState({
          recipeObjectivesState: Mocks.RecipeObjectivesState,
        } as any)
      ).toEqual(Mocks.RecipeObjectivesState);
      expect(Selectors.getIds.projector(Mocks.RecipeObjectivesState)).toEqual(
        Mocks.RecipeObjectivesState.ids
      );
      expect(
        Selectors.getEntities.projector(Mocks.RecipeObjectivesState)
      ).toEqual(Mocks.RecipeObjectivesState.entities);
    });
  });

  describe('getBaseRecipeObjectives', () => {
    it('should return the array of objectives', () => {
      const result = Selectors.getBaseRecipeObjectives.projector(
        Mocks.RecipeObjectivesState.ids,
        Mocks.RecipeObjectivesState.entities,
        Mocks.Dataset
      );
      expect(result).toEqual(Mocks.RecipeObjectivesList);
    });
  });

  describe('getRecipeObjectivess', () => {
    it('should adjust recipe objectives based on settings', () => {
      spyOn(RecipeUtility, 'adjustRecipeObjective');
      Selectors.getRecipeObjectives.projector(
        [Mocks.RecipeObjective1],
        Mocks.MachinesStateInitial,
        Mocks.Dataset
      );
      expect(RecipeUtility.adjustObjective).toHaveBeenCalledWith(
        Mocks.RecipeObjective1,
        Mocks.MachinesStateInitial,
        Mocks.Dataset
      );
    });
  });

  describe('getRationalRecipeObjectives', () => {
    it('should convert objectives to rationals', () => {
      spyOn(RecipeUtility, 'adjustRecipe');
      Selectors.getRecipeObjectiveRationals.projector(
        [Mocks.RecipeObjective1],
        Mocks.AdjustmentData,
        Mocks.ItemsStateInitial
      );
      expect(RecipeUtility.adjustRecipe).toHaveBeenCalledTimes(1);
    });
  });
});

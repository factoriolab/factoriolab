import * as mocks from 'src/mocks';
import * as actions from './recipe.actions';
import { recipeReducer, initialRecipeState } from './recipe.reducer';

describe('Recipe Reducer', () => {
  const numberValue = 2;

  describe('LOAD', () => {
    it('should load recipe settings', () => {
      const result = recipeReducer(
        undefined,
        new actions.LoadAction(mocks.RecipeSettingsEntities)
      );
      expect(result).toEqual(mocks.RecipeSettingsEntities);
    });
  });

  describe('IGNORE', () => {
    it('should ignore a recipe', () => {
      const result = recipeReducer(
        initialRecipeState,
        new actions.IgnoreAction(mocks.Recipe1.id)
      );
      expect(result[mocks.Recipe1.id].ignore).toEqual(true);
    });
  });

  describe('EDIT_FACTORY_MODULE', () => {
    it('should edit the factory module', () => {
      const result = recipeReducer(
        initialRecipeState,
        new actions.EditFactoryModuleAction([
          mocks.Recipe1.id,
          [mocks.Item1.id],
        ])
      );
      expect(result[mocks.Recipe1.id].modules).toEqual([mocks.Item1.id]);
    });
  });

  describe('EDIT_BEACON_MODULE', () => {
    it('should edit the beacon module', () => {
      const result = recipeReducer(
        initialRecipeState,
        new actions.EditBeaconModuleAction([mocks.Recipe1.id, mocks.Item1.id])
      );
      expect(result[mocks.Recipe1.id].beaconModule).toEqual(mocks.Item1.id);
    });
  });

  describe('EDIT_BEACONS_COUNT', () => {
    it('should edit the beacon count', () => {
      const result = recipeReducer(
        initialRecipeState,
        new actions.EditBeaconCountAction([mocks.Recipe1.id, numberValue])
      );
      expect(result[mocks.Recipe1.id].beaconCount).toEqual(numberValue);
    });
  });

  describe('RESET', () => {
    it('should reset a recipe', () => {
      const result = recipeReducer(
        initialRecipeState,
        new actions.ResetAction(mocks.Recipe1.id)
      );
      expect(result[mocks.Recipe1.id]).toBeUndefined();
    });
  });

  it('should return default state', () => {
    expect(recipeReducer(undefined, { type: 'Test' } as any)).toBe(
      initialRecipeState
    );
  });
});

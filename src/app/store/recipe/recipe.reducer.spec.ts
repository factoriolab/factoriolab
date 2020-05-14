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

    it('should delete key if ignore = false is the only modification', () => {
      let result = recipeReducer(
        initialRecipeState,
        new actions.IgnoreAction(mocks.Recipe1.id)
      );
      result = recipeReducer(
        result,
        new actions.IgnoreAction(mocks.Recipe1.id)
      );
      expect(result[mocks.Recipe1.id]).toBeUndefined();
    });
  });

  describe('SET_BELT', () => {
    it('should set the belt', () => {
      const result = recipeReducer(
        initialRecipeState,
        new actions.SetBeltAction([mocks.Recipe1.id, mocks.Item1.id])
      );
      expect(result[mocks.Recipe1.id].belt).toEqual(mocks.Item1.id);
    });
  });

  describe('SET_FACTORY', () => {
    it('should set the factory', () => {
      const result = recipeReducer(
        initialRecipeState,
        new actions.SetFactoryAction([mocks.Recipe1.id, mocks.Item1.id])
      );
      expect(result[mocks.Recipe1.id].factory).toEqual(mocks.Item1.id);
    });
  });

  describe('SET_MODULES', () => {
    it('should set the modules', () => {
      const result = recipeReducer(
        initialRecipeState,
        new actions.SetModulesAction([mocks.Recipe1.id, [mocks.Item1.id]])
      );
      expect(result[mocks.Recipe1.id].modules).toEqual([mocks.Item1.id]);
    });
  });

  describe('SET_BEACON_MODULE', () => {
    it('should set the beacon module', () => {
      const result = recipeReducer(
        initialRecipeState,
        new actions.SetBeaconModuleAction([mocks.Recipe1.id, mocks.Item1.id])
      );
      expect(result[mocks.Recipe1.id].beaconModule).toEqual(mocks.Item1.id);
    });
  });

  describe('SET_BEACONS_COUNT', () => {
    it('should set the beacon count', () => {
      const result = recipeReducer(
        initialRecipeState,
        new actions.SetBeaconCountAction([mocks.Recipe1.id, numberValue])
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

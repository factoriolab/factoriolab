import * as actions from './recipe.actions';
import { recipeReducer, initialRecipeState } from './recipe.reducer';

describe('Recipe Reducer', () => {
  const id = 'test';
  const stringValue = 'value';
  const numberValue = 2;

  describe('IGNORE_RECIPE', () => {
    it('should ignore a recipe', () => {
      const result = recipeReducer(
        initialRecipeState,
        new actions.IgnoreRecipeAction(id)
      );
      expect(result[id].ignore).toEqual(true);
    });
  });

  describe('EDIT_BEACON_TYPE', () => {
    it('should edit the beacon type', () => {
      const result = recipeReducer(
        initialRecipeState,
        new actions.EditBeaconTypeAction([id, stringValue])
      );
      expect(result[id].beaconType).toEqual(stringValue);
    });
  });

  describe('EDIT_BEACONS_COUNT', () => {
    it('should edit the beacon count', () => {
      const result = recipeReducer(
        initialRecipeState,
        new actions.EditBeaconCountAction([id, numberValue])
      );
      expect(result[id].beaconCount).toEqual(numberValue);
    });
  });

  it('should return default state', () => {
    expect(recipeReducer(initialRecipeState, { type: 'Test' } as any)).toBe(
      initialRecipeState
    );
  });
});

import * as mocks from 'src/mocks';
import * as actions from './recipe.actions';
import { recipeReducer, initialRecipeState } from './recipe.reducer';

describe('Recipe Reducer', () => {
  const numberValue = 2;

  describe('IGNORE_RECIPE', () => {
    it('should ignore a recipe', () => {
      const result = recipeReducer(
        initialRecipeState,
        new actions.IgnoreRecipeAction(mocks.Recipe1.id)
      );
      expect(result[mocks.Recipe1.id].ignore).toEqual(true);
    });
  });

  describe('EDIT_BEACON_TYPE', () => {
    it('should edit the beacon type', () => {
      const result = recipeReducer(
        initialRecipeState,
        new actions.EditBeaconTypeAction([mocks.Recipe1.id, mocks.Item1.id])
      );
      expect(result[mocks.Recipe1.id].beaconType).toEqual(mocks.Item1.id);
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

  it('should return default state', () => {
    expect(recipeReducer(undefined, { type: 'Test' } as any)).toBe(
      initialRecipeState
    );
  });
});

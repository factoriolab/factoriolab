import { DisplayRate, ItemId, RecipeId } from '~/models';
import * as actions from './settings.actions';
import { settingsReducer, initialSettingsState } from './settings.reducer';

describe('Settings Reducer', () => {
  describe('SET_DISPLAY_RATE', () => {
    it('should set the display rate', () => {
      const value = DisplayRate.PerHour;
      const result = settingsReducer(
        initialSettingsState,
        new actions.SetDisplayRateAction(value)
      );
      expect(result.displayRate).toEqual(value);
    });
  });

  describe('SET_BELT', () => {
    it('should set the belt type', () => {
      const belt = ItemId.TransportBelt;
      const result = settingsReducer(
        initialSettingsState,
        new actions.SetBeltAction(belt)
      );
      expect(result.belt).toEqual(belt);
    });
  });

  describe('SET_OIL_RECIPE', () => {
    it('should set the oil recipe', () => {
      const recipe = RecipeId.BasicOilProcessing;
      const result = settingsReducer(
        initialSettingsState,
        new actions.SetOilProcessingRecipeAction(recipe)
      );
      expect(result.oilRecipe).toEqual(recipe);
    });
  });

  it('should return default state', () => {
    expect(settingsReducer(undefined, { type: 'Test' } as any)).toBe(
      initialSettingsState
    );
  });
});

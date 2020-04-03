import { DisplayRate } from '~/models';
import * as actions from './settings.actions';
import { settingsReducer, initialSettingsState } from './settings.reducer';

describe('Settings Reducer', () => {
  const stringValue = 'value';

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
      const result = settingsReducer(
        initialSettingsState,
        new actions.SetBeltAction(stringValue)
      );
      expect(result.belt).toEqual(stringValue);
    });
  });

  describe('SET_OIL_RECIPE', () => {
    it('should set the oil recipe', () => {
      const result = settingsReducer(
        initialSettingsState,
        new actions.SetOilProcessingRecipeAction(stringValue)
      );
      expect(result.oilRecipe).toEqual(stringValue);
    });
  });

  describe('SET_USE_CRACKING', () => {
    it('should set whether to use oil cracking', () => {
      const result = settingsReducer(
        initialSettingsState,
        new actions.SetUseCrackingAction(false)
      );
      expect(result.useCracking).toEqual(false);
    });
  });

  it('should return default state', () => {
    expect(settingsReducer(initialSettingsState, { type: 'Test' } as any)).toBe(
      initialSettingsState
    );
  });
});

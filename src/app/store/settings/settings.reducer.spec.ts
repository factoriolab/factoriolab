import { DisplayRate, ItemId, RecipeId } from '~/models';
import * as actions from './settings.actions';
import { settingsReducer, initialSettingsState } from './settings.reducer';

describe('Settings Reducer', () => {
  describe('LOAD', () => {
    it('should load settings', () => {
      const result = settingsReducer(
        undefined,
        new actions.LoadAction({ displayRate: DisplayRate.PerHour } as any)
      );
      expect(result.displayRate).toEqual(DisplayRate.PerHour);
    });
  });

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

  describe('SET_ITEM_PRECISION', () => {
    it('should set the item precision', () => {
      const result = settingsReducer(
        initialSettingsState,
        new actions.SetItemPrecisionAction(null)
      );
      expect(result.itemPrecision).toEqual(null);
    });
  });

  describe('SET_BELT_PRECISION', () => {
    it('should set the belt precision', () => {
      const result = settingsReducer(
        initialSettingsState,
        new actions.SetBeltPrecisionAction(null)
      );
      expect(result.beltPrecision).toEqual(null);
    });
  });

  describe('SET_FACTORY_PRECISION', () => {
    it('should set the factory precision', () => {
      const result = settingsReducer(
        initialSettingsState,
        new actions.SetFactoryPrecisionAction(null)
      );
      expect(result.factoryPrecision).toEqual(null);
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

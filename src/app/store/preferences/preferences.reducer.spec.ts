import { Column, PowerUnit } from '~/models';
import * as App from '../app.actions';
import * as Actions from './preferences.actions';
import {
  initialPreferencesState,
  preferencesReducer,
} from './preferences.reducer';

describe('Preferences Reducer', () => {
  const id = 'id';
  const value = 'value';

  describe('RESET', () => {
    it('should return the initial state', () => {
      const result = preferencesReducer(undefined, new App.ResetAction());
      expect(result).toEqual(initialPreferencesState);
    });
  });

  describe('SAVE_STATE', () => {
    it('should save the specified state', () => {
      const result = preferencesReducer(
        undefined,
        new Actions.SaveStateAction({ id, value })
      );
      expect(result.states).toEqual({ [id]: value });
    });
  });

  describe('REMOVE_STATE', () => {
    it('should remove the specified state', () => {
      const result = preferencesReducer(
        { states: { [id]: value } } as any,
        new Actions.RemoveStateAction(id)
      );
      expect(result.states).toEqual({});
    });
  });

  describe('SET_COLUMNS', () => {
    it('should set the columns state', () => {
      const columns = { [Column.Power]: { show: true } } as any;
      const result = preferencesReducer(
        undefined,
        new Actions.SetColumnsAction(columns)
      );
      expect(result.columns).toEqual(columns);
    });

    it('should reset power unit if power column is hidden', () => {
      const result = preferencesReducer(
        { powerUnit: PowerUnit.MW } as any,
        new Actions.SetColumnsAction({ [Column.Power]: {} } as any)
      );
      expect(result.powerUnit).toEqual(PowerUnit.Auto);
    });
  });

  describe('SET_LINK_SIZE', () => {
    it('should set the link size', () => {
      const result = preferencesReducer(
        undefined,
        new Actions.SetLinkSizeAction(value as any)
      );
      expect(result.linkSize).toEqual(value as any);
    });
  });

  describe('SET_LINK_TEXT', () => {
    it('should set the link text', () => {
      const result = preferencesReducer(
        undefined,
        new Actions.SetLinkTextAction(value as any)
      );
      expect(result.linkText).toEqual(value as any);
    });
  });

  describe('SET_SANKEY_ALIGN', () => {
    it('should set the sankey alignment', () => {
      const result = preferencesReducer(
        undefined,
        new Actions.SetSankeyAlignAction(value as any)
      );
      expect(result.sankeyAlign).toEqual(value as any);
    });
  });

  describe('SET_SIMPLEX', () => {
    it('should set the simplex flag', () => {
      const result = preferencesReducer(
        undefined,
        new Actions.SetSimplexAction(false)
      );
      expect(result.simplex).toEqual(false);
    });
  });

  describe('SET_LANGUAGE', () => {
    it('should set the language', () => {
      const result = preferencesReducer(
        undefined,
        new Actions.SetLanguageAction(value)
      );
      expect(result.language).toEqual(value);
    });
  });

  describe('SET_POWER_UNIT', () => {
    it('should set the power unit', () => {
      const result = preferencesReducer(
        undefined,
        new Actions.SetPowerUnitAction(PowerUnit.MW)
      );
      expect(result.powerUnit).toEqual(PowerUnit.MW);
    });
  });

  it('should return the default state', () => {
    expect(preferencesReducer(undefined, { type: 'Test' } as any)).toEqual(
      initialPreferencesState
    );
  });
});

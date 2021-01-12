import { ResetAction } from '../app.actions';
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
      const result = preferencesReducer(null, new ResetAction());
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
      const result = preferencesReducer(
        undefined,
        new Actions.SetColumnsAction(value as any)
      );
      expect(result.columns).toEqual(value as any);
    });
  });

  describe('SET_LINK_VALUE', () => {
    it('should set the link value', () => {
      const result = preferencesReducer(
        undefined,
        new Actions.SetLinkValueAction(value as any)
      );
      expect(result.linkValue).toEqual(value as any);
    });
  });

  it('should return the default state', () => {
    expect(preferencesReducer(undefined, { type: 'Test' } as any)).toEqual(
      initialPreferencesState
    );
  });
});

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

  it('should return the default state', () => {
    expect(preferencesReducer(undefined, { type: 'Test' } as any)).toEqual(
      initialPreferencesState
    );
  });
});

import { BrowserUtility, StorageKey } from './browser.utility';

describe('BrowserUtility', () => {
  afterEach(() => {
    localStorage.clear();
  });

  describe('search', () => {
    it('should get the window.location property', () => {
      expect(BrowserUtility.search).toEqual(
        window.location.search.substring(1),
      );
    });
  });

  describe('href', () => {
    it('should get the window.location property', () => {
      expect(BrowserUtility.href).toEqual(window.location.href);
    });
  });

  describe('mergeState', () => {
    it('should merge the stored preferences into the state', () => {
      const preferencesState: any = { pref: 'value', columns: {}, states: {} };
      spyOnProperty(BrowserUtility, 'preferencesState', 'get').and.returnValue(
        preferencesState,
      );
      const initial: any = {
        a: { test: 'initial' },
        preferencesState: { columns: {}, states: {} },
      };
      expect(BrowserUtility.mergeState(initial)).toEqual({
        a: { test: 'initial' },
        preferencesState,
      } as any);
    });

    it('should return the initial state if nothing is stored', () => {
      spyOnProperty(BrowserUtility, 'preferencesState', 'get').and.returnValue(
        null,
      );
      const state: any = { a: 'a' };
      expect(BrowserUtility.mergeState(state)).toEqual(state);
    });
  });

  describe('preferencesState', () => {
    it('should get/set', () => {
      const preferencesState: any = { pref: 'value' };
      BrowserUtility.preferencesState = preferencesState;
      expect(BrowserUtility.preferencesState).toEqual(preferencesState);
      BrowserUtility.preferencesState = null;
      expect(BrowserUtility.preferencesState).toEqual(null);
    });

    it('should handle parsing errors', () => {
      localStorage.setItem(StorageKey.Preferences, '{[');
      expect(BrowserUtility.preferencesState).toEqual(null);
    });
  });

  describe('routerState', () => {
    it('should get/set', () => {
      BrowserUtility.routerState = 'routerState';
      expect(BrowserUtility.routerState).toEqual('routerState');
      BrowserUtility.routerState = null;
      expect(BrowserUtility.routerState).toEqual(null);
    });
  });
});

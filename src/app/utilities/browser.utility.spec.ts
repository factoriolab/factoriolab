import { STATE_KEY } from '~/models';
import * as Settings from '~/store/settings';
import { BrowserUtility } from './browser.utility';

describe('BrowserUtility', () => {
  afterEach(() => {
    localStorage.clear();
  });

  describe('storedState', () => {
    it('should get the local property', () => {
      expect(BrowserUtility.storedState).toEqual(
        BrowserUtility['_storedState']
      );
    });
  });

  describe('href', () => {
    it('should get the window property', () => {
      expect(BrowserUtility.href).toEqual(location.href);
    });
  });

  describe('zip', () => {
    it('should get the search value', () => {
      spyOnProperty(BrowserUtility, 'search').and.returnValue('test');
      expect(BrowserUtility.zip).toEqual('test');
    });

    it('should check for hash length', () => {
      spyOnProperty(BrowserUtility, 'hash').and.returnValue('z');
      expect(BrowserUtility.zip).toEqual('');
    });

    it('should check for = in hash', () => {
      spyOnProperty(BrowserUtility, 'hash').and.returnValue('zz');
      expect(BrowserUtility.zip).toEqual('');
    });

    it('should use valid hash as zip state', () => {
      spyOnProperty(BrowserUtility, 'hash').and.returnValue('p=');
      expect(BrowserUtility.zip).toEqual('p=');
    });
  });

  describe('loadState', () => {
    it('should return the state from local storage', () => {
      localStorage.setItem(
        STATE_KEY,
        JSON.stringify(Settings.initialSettingsState)
      );
      expect(BrowserUtility.loadState()).toEqual(
        Settings.initialSettingsState as any
      );
    });

    it('should clean up if an error is encountered', () => {
      localStorage.setItem(STATE_KEY, 'test');
      spyOn(console, 'error');
      expect(BrowserUtility.loadState()).toBeNull();
      expect(console.error).toHaveBeenCalledTimes(2);
      expect(localStorage.getItem(STATE_KEY)).toBeNull();
    });
  });

  describe('mergeState', () => {
    it('should merge the stored preferences into the state', () => {
      const preferencesState: any = { pref: 'value' };
      spyOnProperty(BrowserUtility, 'zip').and.returnValue('hash');
      spyOnProperty(BrowserUtility, 'storedState', 'get').and.returnValue({
        preferencesState,
      });
      const initial: any = { a: { test: 'initial' } };
      expect(BrowserUtility.mergeState(initial)).toEqual({
        a: { test: 'initial' },
        preferencesState,
      } as any);
    });

    it('should return the full stored state if there is no hash', () => {
      const preferencesState: any = { pref: 'value' };
      const stored: any = { a: { test: 'stored' }, preferencesState };
      spyOnProperty(BrowserUtility, 'storedState', 'get').and.returnValue(
        stored
      );
      const initial: any = { a: { test: 'initial' }, preferencesState };
      expect(BrowserUtility.mergeState(initial)).toEqual(stored);
    });

    it('should return the initial state if nothing is stored', () => {
      spyOnProperty(BrowserUtility, 'storedState', 'get').and.returnValue(null);
      const state: any = { a: 'a' };
      expect(BrowserUtility.mergeState(state)).toEqual(state);
    });
  });

  describe('saveState', () => {
    it('should save the state except datasets', () => {
      const state: any = { a: 'a', datasetsState: 'data' };
      BrowserUtility.saveState(state);
      expect(localStorage.getItem(STATE_KEY)).toEqual(`{"a":"a"}`);
    });
  });
});

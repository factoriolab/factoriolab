import { BrowserUtility } from './browser.utility';

describe('BrowserUtility', () => {
  afterEach(() => {
    localStorage.clear();
  });

  describe('href', () => {
    it('should get the window property', () => {
      expect(BrowserUtility.href).toEqual(location.href);
    });
  });

  // describe('mergeState', () => {
  // it('should merge the stored preferences into the state', () => {
  //   const preferencesState: any = { pref: 'value' };
  //   spyOnProperty(BrowserUtility, 'zip').and.returnValue('hash');
  //   spyOnProperty(BrowserUtility, 'storedState', 'get').and.returnValue({
  //     preferencesState,
  //   });
  //   const initial: any = { a: { test: 'initial' } };
  //   expect(BrowserUtility.mergeState(initial)).toEqual({
  //     a: { test: 'initial' },
  //     preferencesState,
  //   } as any);
  // });
  // it('should return the full stored state if there is no hash', () => {
  //   const preferencesState: any = { pref: 'value', columns: { A: {} } };
  //   const stored: any = {
  //     a: { test: 'stored' },
  //     preferencesState,
  //   };
  //   spyOnProperty(BrowserUtility, 'storedState', 'get').and.returnValue(
  //     stored
  //   );
  //   const initial: any = { a: { test: 'initial' }, preferencesState };
  //   expect(BrowserUtility.mergeState(initial)).toEqual({
  //     a: { test: 'stored' },
  //     preferencesState: { pref: 'value', columns: { a: {} } },
  //   } as any);
  // });
  // it('should return the initial state if nothing is stored', () => {
  //   spyOnProperty(BrowserUtility, 'storedState', 'get').and.returnValue(null);
  //   const state: any = { a: 'a' };
  //   expect(BrowserUtility.mergeState(state)).toEqual(state);
  // });
  // it('should remove unrecognized keys', () => {
  //   const preferencesState: any = { pref: 'value' };
  //   const stored: any = { a: { test: 'stored' }, preferencesState };
  //   spyOnProperty(BrowserUtility, 'storedState', 'get').and.returnValue(
  //     stored
  //   );
  //   const result: any = BrowserUtility.mergeState(preferencesState);
  //   expect(result['a']).toBeUndefined();
  // });
  // });
});

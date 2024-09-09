import { Mocks } from 'src/tests';

import * as Actions from './datasets.actions';
import { datasetsReducer, initialState } from './datasets.reducer';

describe('Dataset Reducer', () => {
  const id = 'id';

  describe('LOAD_MOD_DATA', () => {
    it('should handle null values', () => {
      const result = datasetsReducer(
        initialState,
        Actions.loadMod({
          id,
          i18nId: id,
          data: undefined,
          hash: undefined,
          i18n: undefined,
        }),
      );
      expect(result.data).toEqual({ id: undefined });
      expect(result.hash).toEqual({ id: undefined });
      expect(result.i18n).toEqual({ id: undefined });
    });

    it('should load mod data', () => {
      const result = datasetsReducer(
        initialState,
        Actions.loadMod({
          id,
          i18nId: id,
          data: Mocks.Data,
          hash: Mocks.Hash,
          i18n: Mocks.I18n,
        }),
      );
      expect(result.data[id]).toEqual(Mocks.Data);
      expect(result.hash[id]).toEqual(Mocks.Hash);
      expect(result.i18n[id]).toEqual(Mocks.I18n);
    });
  });

  it('should return default state', () => {
    expect(datasetsReducer(undefined, { type: 'Test' } as any)).toEqual(
      initialState,
    );
  });
});

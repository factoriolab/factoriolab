import { Mocks } from '~/tests';

import { loadMod } from './datasets.actions';
import { datasetsReducer, initialDatasetsState } from './datasets.reducer';

describe('Dataset Reducer', () => {
  const id = 'id';

  describe('LOAD_MOD_DATA', () => {
    it('should handle null values', () => {
      const result = datasetsReducer(
        initialDatasetsState,
        loadMod({
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
        initialDatasetsState,
        loadMod({
          id,
          i18nId: id,
          data: Mocks.modData,
          hash: Mocks.modHash,
          i18n: Mocks.modI18n,
        }),
      );
      expect(result.data[id]).toEqual(Mocks.modData);
      expect(result.hash[id]).toEqual(Mocks.modHash);
      expect(result.i18n[id]).toEqual(Mocks.modI18n);
    });
  });

  it('should return default state', () => {
    expect(datasetsReducer(undefined, { type: 'Test' } as any)).toEqual(
      initialDatasetsState,
    );
  });
});

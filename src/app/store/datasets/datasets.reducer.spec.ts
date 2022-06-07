import { Mocks } from 'src/tests';
import * as Actions from './datasets.actions';
import { datasetsReducer, initialDatasetsState } from './datasets.reducer';

describe('Dataset Reducer', () => {
  describe('LOAD_MOD_DATA', () => {
    it('should handle null values', () => {
      const result = datasetsReducer(
        initialDatasetsState,
        new Actions.LoadModAction({
          data: null,
          hash: null,
          i18n: null,
        })
      );
      expect(result.dataEntities).toEqual({});
      expect(result.hashEntities).toEqual({});
      expect(result.i18nEntities).toEqual({});
    });

    it('should load mod data', () => {
      const id = 'id';
      const result = datasetsReducer(
        initialDatasetsState,
        new Actions.LoadModAction({
          data: { id, value: Mocks.Data },
          hash: { id, value: Mocks.Hash },
          i18n: { id, value: Mocks.I18n },
        })
      );
      expect(result.dataEntities[id]).toEqual(Mocks.Data);
      expect(result.hashEntities[id]).toEqual(Mocks.Hash);
      expect(result.i18nEntities[id]).toEqual(Mocks.I18n);
    });
  });

  it('should return default state', () => {
    expect(datasetsReducer(undefined, { type: 'Test' } as any)).toEqual(
      initialDatasetsState
    );
  });
});

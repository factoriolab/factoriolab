import { Mocks } from 'src/tests';
import * as Actions from './datasets.actions';
import { datasetsReducer, initialDatasetsState } from './datasets.reducer';

describe('Dataset Reducer', () => {
  describe('LOAD_MOD_DATA', () => {
    it('should load mod data', () => {
      const id = 'id';
      const result = datasetsReducer(
        initialDatasetsState,
        new Actions.LoadModDataAction({ id, value: Mocks.Data })
      );
      expect(result.dataEntities[id]).toEqual(Mocks.Data);
    });
  });

  describe('LOAD_MOD_I18N', () => {
    it('should load mod i18n', () => {
      const id = 'id';
      const result = datasetsReducer(
        initialDatasetsState,
        new Actions.LoadModI18nAction({ id, value: Mocks.I18n })
      );
      expect(result.i18nEntities[id]).toEqual(Mocks.I18n);
    });
  });

  describe('LOAD_MOD_HASH', () => {
    it('should load mod hash', () => {
      const id = 'id';
      const result = datasetsReducer(
        initialDatasetsState,
        new Actions.LoadModHashAction({ id, value: Mocks.Hash })
      );
      expect(result.hashEntities[id]).toEqual(Mocks.Hash);
    });
  });

  it('should return default state', () => {
    expect(datasetsReducer(undefined, { type: 'Test' } as any)).toEqual(
      initialDatasetsState
    );
  });
});

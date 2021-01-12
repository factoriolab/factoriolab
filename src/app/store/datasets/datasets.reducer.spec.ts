import { Mocks } from 'src/tests';
import * as Actions from './datasets.actions';
import { datasetsReducer, initialDatasetsState } from './datasets.reducer';

describe('Dataset Reducer', () => {
  describe('LOAD', () => {
    it('should load mod data', () => {
      const id = 'id';
      const result = datasetsReducer(
        initialDatasetsState,
        new Actions.LoadModAction({ id, value: Mocks.BaseData })
      );
      expect(result.dataEntities[id]).toEqual(Mocks.BaseData);
    });
  });

  it('should return default state', () => {
    expect(datasetsReducer(undefined, { type: 'Test' } as any)).toEqual(
      initialDatasetsState
    );
  });
});

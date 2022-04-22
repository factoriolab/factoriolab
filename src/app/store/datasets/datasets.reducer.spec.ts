import { Mocks } from 'src/tests';
import * as Actions from './datasets.actions';
import { datasetsReducer, initialDatasetsState } from './datasets.reducer';

xdescribe('Dataset Reducer', () => {
  describe('LOAD', () => {
    it('should load mod data', () => {
      const id = 'id';
      const result = datasetsReducer(
        initialDatasetsState,
        new Actions.LoadModDataAction({ id, value: Mocks.BaseData })
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

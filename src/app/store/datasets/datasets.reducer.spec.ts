import { Mocks } from 'src/tests';
import * as Actions from './datasets.actions';
import { datasetsReducer, initialDatasetsState } from './datasets.reducer';

export const state = initialDatasetsState;

describe('Dataset Reducer', () => {
  describe('LOAD', () => {
    it('should load mod data', () => {
      const id = 'id';
      const result = datasetsReducer(
        state,
        new Actions.LoadModAction({ id, value: Mocks.BaseData })
      );
      expect(result.dataEntities[id]).toEqual(Mocks.BaseData);
    });
  });

  it('should return default state', () => {
    expect(datasetsReducer(state, { type: 'Test' } as any)).toBe(state);
  });
});

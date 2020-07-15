import { Mocks } from 'src/tests';
import * as Actions from './datasets.actions';
import { datasetsReducer } from './datasets.reducer';

export const state = datasetsReducer(
  undefined,
  new Actions.LoadDataAction(Mocks.Raw)
);

describe('Dataset Reducer', () => {
  describe('LOAD', () => {
    it('should load mod data', () => {});
  });

  it('should return default state', () => {
    expect(datasetsReducer(state, { type: 'Test' } as any)).toBe(state);
  });
});

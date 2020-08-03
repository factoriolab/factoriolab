import { Mocks } from 'src/tests';
import * as Actions from './datasets.actions';
import { datasetsReducer } from './datasets.reducer';

export const state = datasetsReducer(
  undefined,
  new Actions.LoadAppAction(Mocks.Raw)
);

describe('Dataset Reducer', () => {
  describe('LOAD', () => {
    it('should load mod data', () => {
      expect(state.baseIds.length).toBeGreaterThan(0);
      expect(Object.keys(state.baseEntities).length).toEqual(
        state.baseIds.length
      );
      expect(state.modIds.length).toBeGreaterThan(0);
      expect(Object.keys(state.dataEntities).length).toEqual(
        state.modIds.length
      );
    });
  });

  it('should return default state', () => {
    expect(datasetsReducer(state, { type: 'Test' } as any)).toBe(state);
  });
});

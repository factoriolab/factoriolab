import { Mocks } from 'src/tests';
import * as Actions from './dataset.actions';
import { datasetReducer } from './dataset.reducer';

export const state = datasetReducer(
  undefined,
  new Actions.LoadDatasetAction(Mocks.Raw)
);

describe('Dataset Reducer', () => {
  describe('LOAD', () => {
    it('should load items', () => {
      const count = Mocks.Data.itemIds.length;
      expect(state.itemIds.length).toBe(count);
      expect(Object.keys(state.itemEntities).length).toBe(count);
    });

    it('should load categories', () => {
      const count = Mocks.Data.categoryIds.length;
      expect(state.categoryIds.length).toBe(count);
      expect(Object.keys(state.categoryEntities).length).toBe(count);
    });

    it('should load recipes', () => {
      const count = Mocks.Data.recipeIds.length;
      expect(state.recipeIds.length).toBe(count);
      expect(Object.keys(state.recipeEntities).length).toBe(count);
    });
  });

  it('should return default state', () => {
    expect(datasetReducer(state, { type: 'Test' } as any)).toBe(state);
  });
});

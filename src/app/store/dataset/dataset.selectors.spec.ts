import Fraction from 'fraction.js';

import * as mocks from 'src/mocks';
import * as actions from './dataset.actions';
import { datasetReducer } from './dataset.reducer';
import * as selectors from './dataset.selectors';

describe('Dataset Selectors', () => {
  const state = datasetReducer(
    undefined,
    new actions.LoadDatasetAction(mocks.Data)
  );

  describe('getItems', () => {
    it('should handle an empty array', () => {
      const result = selectors.getItems.projector([], {});
      expect(result.length).toEqual(0);
    });

    it('should return the array of items', () => {
      const result = selectors.getItems.projector(
        state.itemIds,
        state.itemEntities
      );
      expect(result.length).toEqual(state.itemIds.length);
    });
  });

  describe('getCategories', () => {
    it('should handle an empty array', () => {
      const result = selectors.getCategories.projector([], {});
      expect(result.length).toEqual(0);
    });

    it('should return the array of categories', () => {
      const result = selectors.getCategories.projector(
        state.categoryIds,
        state.categoryEntities
      );
      expect(result.length).toEqual(state.categoryIds.length);
    });
  });

  describe('getRecipes', () => {
    it('should handle an empty array', () => {
      const result = selectors.getRecipes.projector([], {});
      expect(result.length).toEqual(0);
    });

    it('should return the array of recipes', () => {
      const result = selectors.getRecipes.projector(
        state.recipeIds,
        state.recipeEntities
      );
      expect(result.length).toEqual(state.recipeIds.length);
    });
  });

  describe('getBeltIds', () => {
    it('should handle an empty array', () => {
      const result = selectors.getBeltIds.projector([], {});
      expect(result.length).toEqual(0);
    });

    it('should return the array of belt ids', () => {
      const result = selectors.getBeltIds.projector(
        state.itemIds,
        state.itemEntities
      );
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('getBeltSpeed', () => {
    it('should handle an empty array', () => {
      const result = selectors.getBeltSpeed.projector([], {});
      expect(Object.keys(result).length).toEqual(0);
    });

    it('should return the map of belt speeds', () => {
      const beltId = 'transport-belt';
      const result = selectors.getBeltSpeed.projector(
        [beltId],
        state.itemEntities
      );
      expect(result[beltId]).toEqual(
        new Fraction(state.itemEntities[beltId].belt.speed)
      );
    });
  });
});

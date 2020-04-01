import Fraction from 'fraction.js';

import * as mocks from 'src/mocks';
import { Rate } from '~/utilities/rate';
import { initialSettingsState } from '../settings';
import { state as datasetState } from '../dataset/dataset.reducer.spec';
import * as actions from './products.actions';
import { productsReducer } from './products.reducer';
import * as selectors from './products.selectors';

describe('Products Selectors', () => {
  const state = productsReducer(undefined, new actions.AddAction());

  describe('getProducts', () => {
    it('should handle an empty array', () => {
      const result = selectors.getProducts.projector([], {});
      expect(result.length).toEqual(0);
    });

    it('should return the array of products', () => {
      const result = selectors.getProducts.projector(state.ids, state.entities);
      expect(result.length).toEqual(1);
    });
  });

  describe('getItemRows', () => {
    it('should handle an empty array', () => {
      const result = selectors.getItemRows.projector(null, []);
      expect(result.length).toEqual(1);
      expect(result[0].length).toEqual(0);
    });

    it('should return rows of items for the current category', () => {
      const result = selectors.getItemRows.projector(
        state.categoryId,
        mocks.Data.items
      );
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].length).toBeGreaterThan(0);
    });
  });

  describe('getSteps', () => {
    it('should handle null/empty values', () => {
      const result = selectors.getSteps.projector([], {}, {}, {}, {}, {}, {});
      expect(result.length).toEqual(0);
    });

    it('should calculate steps', () => {
      spyOn(Rate, 'normalizeRate').and.returnValue(new Fraction(1));
      spyOn(Rate, 'addStepsFor');
      selectors.getSteps.projector(
        mocks.Products,
        initialSettingsState,
        {},
        {},
        {},
        datasetState.itemEntities,
        datasetState.recipeEntities
      );
      expect(Rate.normalizeRate).toHaveBeenCalled();
      expect(Rate.addStepsFor).toHaveBeenCalled();
    });
  });
});

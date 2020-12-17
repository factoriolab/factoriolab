import { Mocks, ItemId, RecipeId } from 'src/tests';
import { RateType } from '~/models';
import { LoadAction } from '../app.actions';
import * as Actions from './products.actions';
import { productsReducer, ProductsState } from './products.reducer';

describe('Products Reducer', () => {
  const state = productsReducer(
    undefined,
    new Actions.AddAction(ItemId.WoodenChest)
  );

  describe('LOAD', () => {
    it('should load a list of products', () => {
      const productsState: ProductsState = {
        ids: ['id'],
        entities: { id: Mocks.Product1 },
        index: 1,
      };
      const result = productsReducer(
        undefined,
        new LoadAction({ productsState } as any)
      );
      expect(result).toEqual(productsState);
    });
  });

  describe('ADD', () => {
    it('should add a new product', () => {
      expect(state.ids.length).toEqual(1);
    });
  });

  describe('REMOVE', () => {
    it('should remove a product', () => {
      const result = productsReducer(state, new Actions.RemoveAction('0'));
      expect(result.ids.length).toEqual(0);
    });
  });

  describe('EDIT_PRODUCT', () => {
    it('should commit edit on a product', () => {
      const result = productsReducer(
        state,
        new Actions.EditItemAction({
          id: Mocks.Product1.id,
          value: Mocks.Product2.itemId,
        })
      );
      expect(result.entities[Mocks.Product1.id].itemId).toEqual(
        Mocks.Product2.itemId
      );
    });
  });

  describe('EDIT_RATE', () => {
    it('should edit rate of a product', () => {
      const value = 3;
      const result = productsReducer(
        state,
        new Actions.EditRateAction({ id: Mocks.Product1.id, value })
      );
      expect(result.entities[Mocks.Product1.id].rate).toEqual(value);
    });
  });

  describe('EDIT_RATE_TYPE', () => {
    it('should edit rate type of a product', () => {
      const value = RateType.Wagons;
      const result = productsReducer(
        state,
        new Actions.EditRateTypeAction({ id: Mocks.Product1.id, value })
      );
      expect(result.entities[Mocks.Product1.id].rateType).toEqual(value);
    });
  });

  describe('EDIT_RECIPE', () => {
    it('should edit the recipe of a product', () => {
      const value = RecipeId.AdvancedOilProcessing;
      const result = productsReducer(
        state,
        new Actions.EditRecipeAction({ id: Mocks.Product1.id, value })
      );
      expect(result.entities[Mocks.Product1.id].recipeId).toEqual(value);
    });
  });

  it('should return default state', () => {
    expect(productsReducer(state, { type: 'Test' } as any)).toBe(state);
  });
});

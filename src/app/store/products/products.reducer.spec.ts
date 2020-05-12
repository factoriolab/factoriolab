import * as mocks from 'src/mocks';
import { RateType, ItemId } from '~/models';
import * as actions from './products.actions';
import { productsReducer } from './products.reducer';

describe('Products Reducer', () => {
  const state = productsReducer(
    undefined,
    new actions.AddAction(ItemId.WoodenChest)
  );

  describe('LOAD', () => {
    it('should load a list of products', () => {
      const result = productsReducer(
        undefined,
        new actions.LoadAction(mocks.Products)
      );
      expect(result.ids.length).toEqual(mocks.Products.length);
      expect(Object.keys(result.entities).length).toEqual(
        mocks.Products.length
      );
      expect(result.index).toEqual(mocks.Products.length);
    });
  });

  describe('ADD', () => {
    it('should add a new product', () => {
      expect(state.ids.length).toEqual(1);
    });
  });

  describe('REMOVE', () => {
    it('should remove a product', () => {
      const result = productsReducer(state, new actions.RemoveAction(0));
      expect(result.ids.length).toEqual(0);
    });
  });

  describe('EDIT_PRODUCT', () => {
    it('should commit edit on a product', () => {
      const result = productsReducer(
        state,
        new actions.EditProductAction([
          mocks.Product1.id,
          mocks.Product2.itemId,
        ])
      );
      expect(result.entities[mocks.Product1.id].itemId).toEqual(
        mocks.Product2.itemId
      );
    });
  });

  describe('EDIT_RATE', () => {
    it('should edit rate of a product', () => {
      const value = 3;
      const result = productsReducer(
        state,
        new actions.EditRateAction([mocks.Product1.id, value])
      );
      expect(result.entities[mocks.Product1.id].rate).toEqual(value);
    });
  });

  describe('EDIT_RATE_TYPE', () => {
    it('should edit rate type of a product', () => {
      const value = RateType.Wagons;
      const result = productsReducer(
        state,
        new actions.EditRateTypeAction([mocks.Product1.id, value])
      );
      expect(result.entities[mocks.Product1.id].rateType).toEqual(value);
    });
  });

  it('should return default state', () => {
    expect(productsReducer(state, { type: 'Test' } as any)).toBe(state);
  });
});

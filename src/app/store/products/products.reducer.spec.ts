import { ItemId, Mocks } from 'src/tests';
import { Product, RateType } from '~/models';
import * as App from '../app.actions';
import * as Actions from './products.actions';
import {
  initialProductsState,
  productsReducer,
  ProductsState,
} from './products.reducer';

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
        new App.LoadAction({ productsState })
      );
      expect(result).toEqual(productsState);
    });

    it('should skip loading products state if null', () => {
      const result = productsReducer(undefined, new App.LoadAction({}));
      expect(result).toEqual(initialProductsState);
    });
  });

  describe('App RESET', () => {
    it('should return the initial state', () => {
      const result = productsReducer(undefined, new App.ResetAction());
      expect(result).toEqual(initialProductsState);
    });
  });

  describe('ADD', () => {
    it('should add a new product', () => {
      expect(state.ids.length).toEqual(1);
    });

    it('should use settings from the last added product', () => {
      const state: ProductsState = {
        ids: ['0'],
        entities: {
          ['0']: {
            id: '0',
            itemId: ItemId.Coal,
            rate: '30',
            rateType: RateType.Wagons,
          },
        },
        index: 1,
      };
      const result = productsReducer(state, new Actions.AddAction(ItemId.Wood));
      expect(result.entities['1']).toEqual({
        id: '1',
        itemId: ItemId.Wood,
        rate: '30',
        rateType: RateType.Wagons,
      });
    });
  });

  describe('CREATE', () => {
    it('should create a new product', () => {
      const product: Product = {
        id: '1',
        itemId: ItemId.IronPlate,
        rate: '2',
        rateType: RateType.Items,
      };
      const result = productsReducer(state, new Actions.CreateAction(product));
      expect(result.entities['0']).toEqual({
        id: '0',
        itemId: ItemId.IronPlate,
        rate: '2',
        rateType: RateType.Items,
      });
      expect(result.index).toEqual(1);
    });
  });

  describe('REMOVE', () => {
    it('should remove a product', () => {
      const result = productsReducer(state, new Actions.RemoveAction('0'));
      expect(result.ids.length).toEqual(0);
    });
  });

  describe('SET_ITEM', () => {
    it('should set item on a product', () => {
      const result = productsReducer(
        state,
        new Actions.SetItemAction({
          id: Mocks.Product1.id,
          value: Mocks.Product2.itemId,
        })
      );
      expect(result.entities[Mocks.Product1.id].itemId).toEqual(
        Mocks.Product2.itemId
      );
    });
  });

  describe('SET_RATE', () => {
    it('should set rate of a product', () => {
      const value = '3';
      const result = productsReducer(
        state,
        new Actions.SetRateAction({ id: Mocks.Product1.id, value })
      );
      expect(result.entities[Mocks.Product1.id].rate).toEqual(value);
    });
  });

  describe('SET_RATE_TYPE', () => {
    it('should set rate type of a product', () => {
      const value = RateType.Wagons;
      const result = productsReducer(
        state,
        new Actions.SetRateTypeAction({ id: Mocks.Product1.id, value })
      );
      expect(result.entities[Mocks.Product1.id].rateType).toEqual(value);
    });
  });

  describe('ADJUST_DISPLAY_RATE', () => {
    it('should adjust rates for products when display rate changes', () => {
      const result = productsReducer(
        state,
        new Actions.AdjustDisplayRateAction('1/60')
      );
      expect(result.entities[Mocks.Product1.id].rate).toEqual('1');
    });

    it('should not adjust rates when rate type unaffected by display rate', () => {
      let result = productsReducer(
        state,
        new Actions.SetRateTypeAction({ id: '0', value: RateType.Belts })
      );
      result = productsReducer(
        result,
        new Actions.AdjustDisplayRateAction('1/60')
      );
      expect(result.entities[Mocks.Product1.id].rate).toEqual('60');
    });
  });

  it('should return default state', () => {
    expect(productsReducer(state, { type: 'Test' } as any)).toBe(state);
  });
});

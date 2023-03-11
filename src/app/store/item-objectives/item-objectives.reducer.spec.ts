import { ItemId, Mocks } from 'src/tests';
import { ItemObj, RateUnit } from '~/models';
import * as App from '../app.actions';
import * as Actions from './item-objectives.actions';
import {
  initialItemsObjState,
  itemsObjReducer,
  ItemsObjState,
} from './item-objectives.reducer';

describe('Item Objectives Reducer', () => {
  const state = itemsObjReducer(
    undefined,
    new Actions.AddAction(ItemId.WoodenChest)
  );

  describe('LOAD', () => {
    it('should load a list of products', () => {
      const productsState: ItemsObjState = {
        ids: ['id'],
        entities: { id: Mocks.Product1 },
        index: 1,
      };
      const result = itemsObjReducer(
        undefined,
        new App.LoadAction({ productsState })
      );
      expect(result).toEqual(productsState);
    });

    it('should skip loading products state if null', () => {
      const result = itemsObjReducer(undefined, new App.LoadAction({}));
      expect(result).toEqual(initialItemsObjState);
    });
  });

  describe('App RESET', () => {
    it('should return the initial state', () => {
      const result = itemsObjReducer(undefined, new App.ResetAction());
      expect(result).toEqual(initialItemsObjState);
    });
  });

  describe('ADD', () => {
    it('should add a new product', () => {
      expect(state.ids.length).toEqual(1);
    });

    it('should use settings from the last added product', () => {
      const state: ItemsObjState = {
        ids: ['0'],
        entities: {
          ['0']: {
            id: '0',
            itemId: ItemId.Coal,
            rate: '30',
            rateType: AmountType.Wagons,
          },
        },
        index: 1,
      };
      const result = itemsObjReducer(state, new Actions.AddAction(ItemId.Wood));
      expect(result.entities['1']).toEqual({
        id: '1',
        itemId: ItemId.Wood,
        rate: '30',
        rateType: AmountType.Wagons,
      });
    });
  });

  describe('CREATE', () => {
    it('should create a new product', () => {
      const product: ItemObj = {
        id: '1',
        itemId: ItemId.IronPlate,
        rate: '2',
        rateType: AmountType.Items,
      };
      const result = itemsObjReducer(state, new Actions.CreateAction(product));
      expect(result.entities['0']).toEqual({
        id: '0',
        itemId: ItemId.IronPlate,
        rate: '2',
        rateType: AmountType.Items,
      });
      expect(result.index).toEqual(1);
    });
  });

  describe('REMOVE', () => {
    it('should remove a product', () => {
      const result = itemsObjReducer(state, new Actions.RemoveAction('0'));
      expect(result.ids.length).toEqual(0);
    });
  });

  describe('SET_ITEM', () => {
    it('should set item on a product', () => {
      const result = itemsObjReducer(
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
      const result = itemsObjReducer(
        state,
        new Actions.SetRateAction({ id: Mocks.Product1.id, value })
      );
      expect(result.entities[Mocks.Product1.id].rate).toEqual(value);
    });
  });

  describe('SET_RATE_TYPE', () => {
    it('should set rate type of a product', () => {
      const value = AmountType.Wagons;
      const result = itemsObjReducer(
        state,
        new Actions.SetRateTypeAction({ id: Mocks.Product1.id, value })
      );
      expect(result.entities[Mocks.Product1.id].rateType).toEqual(value);
    });
  });

  describe('ADJUST_DISPLAY_RATE', () => {
    it('should adjust rates for products when display rate changes', () => {
      const result = itemsObjReducer(
        state,
        new Actions.AdjustDisplayRateAction('1/60')
      );
      expect(result.entities[Mocks.Product1.id].rate).toEqual('1');
    });

    it('should not adjust rates when rate type unaffected by display rate', () => {
      let result = itemsObjReducer(
        state,
        new Actions.SetRateTypeAction({ id: '0', value: AmountType.Belts })
      );
      result = itemsObjReducer(
        result,
        new Actions.AdjustDisplayRateAction('1/60')
      );
      expect(result.entities[Mocks.Product1.id].rate).toEqual('60');
    });
  });

  it('should return default state', () => {
    expect(itemsObjReducer(state, { type: 'Test' } as any)).toBe(state);
  });
});

import { ItemId, Mocks } from 'src/tests';
import { AmountType, ItemObjective } from '~/models';
import * as App from '../app.actions';
import * as Actions from './item-objectives.actions';
import {
  initialItemObjectivesState,
  itemObjectivesReducer,
  ItemObjectivesState,
} from './item-objectives.reducer';

describe('Item Objectives Reducer', () => {
  const state = itemObjectivesReducer(
    undefined,
    new Actions.AddAction(ItemId.WoodenChest)
  );

  describe('LOAD', () => {
    it('should load a list of products', () => {
      const productsState: ItemObjectivesState = {
        ids: ['id'],
        entities: { id: Mocks.Product1 },
        index: 1,
      };
      const result = itemObjectivesReducer(
        undefined,
        new App.LoadAction({ productsState })
      );
      expect(result).toEqual(productsState);
    });

    it('should skip loading products state if null', () => {
      const result = itemObjectivesReducer(undefined, new App.LoadAction({}));
      expect(result).toEqual(initialItemObjectivesState);
    });
  });

  describe('App RESET', () => {
    it('should return the initial state', () => {
      const result = itemObjectivesReducer(undefined, new App.ResetAction());
      expect(result).toEqual(initialItemObjectivesState);
    });
  });

  describe('ADD', () => {
    it('should add a new product', () => {
      expect(state.ids.length).toEqual(1);
    });

    it('should use settings from the last added product', () => {
      const state: ItemObjectivesState = {
        ids: ['0'],
        entities: {
          ['0']: {
            id: '0',
            itemId: ItemId.Coal,
            amount: '30',
            amountType: AmountType.Wagons,
          },
        },
        index: 1,
      };
      const result = itemObjectivesReducer(
        state,
        new Actions.AddAction(ItemId.Wood)
      );
      expect(result.entities['1']).toEqual({
        id: '1',
        itemId: ItemId.Wood,
        amount: '30',
        amountType: AmountType.Wagons,
      });
    });
  });

  describe('CREATE', () => {
    it('should create a new product', () => {
      const product: ItemObjective = {
        id: '1',
        itemId: ItemId.IronPlate,
        amount: '2',
        amountType: AmountType.Items,
      };
      const result = itemObjectivesReducer(
        state,
        new Actions.CreateAction(product)
      );
      expect(result.entities['0']).toEqual({
        id: '0',
        itemId: ItemId.IronPlate,
        amount: '2',
        amountType: AmountType.Items,
      });
      expect(result.index).toEqual(1);
    });
  });

  describe('REMOVE', () => {
    it('should remove a product', () => {
      const result = itemObjectivesReducer(
        state,
        new Actions.RemoveAction('0')
      );
      expect(result.ids.length).toEqual(0);
    });
  });

  describe('SET_ITEM', () => {
    it('should set item on a product', () => {
      const result = itemObjectivesReducer(
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
      const result = itemObjectivesReducer(
        state,
        new Actions.SetAmountAction({ id: Mocks.Product1.id, value })
      );
      expect(result.entities[Mocks.Product1.id].amount).toEqual(value);
    });
  });

  describe('SET_RATE_TYPE', () => {
    it('should set rate type of a product', () => {
      const value = AmountType.Wagons;
      const result = itemObjectivesReducer(
        state,
        new Actions.SetAmountTypeAction({ id: Mocks.Product1.id, value })
      );
      expect(result.entities[Mocks.Product1.id].amountType).toEqual(value);
    });
  });

  describe('ADJUST_DISPLAY_RATE', () => {
    it('should adjust rates for products when display rate changes', () => {
      const result = itemObjectivesReducer(
        state,
        new Actions.AdjustDisplayRateAction('1/60')
      );
      expect(result.entities[Mocks.Product1.id].amount).toEqual('1');
    });

    it('should not adjust rates when rate type unaffected by display rate', () => {
      let result = itemObjectivesReducer(
        state,
        new Actions.SetAmountTypeAction({ id: '0', value: AmountType.Belts })
      );
      result = itemObjectivesReducer(
        result,
        new Actions.AdjustDisplayRateAction('1/60')
      );
      expect(result.entities[Mocks.Product1.id].amount).toEqual('60');
    });
  });

  it('should return default state', () => {
    expect(itemObjectivesReducer(state, { type: 'Test' } as any)).toBe(state);
  });
});

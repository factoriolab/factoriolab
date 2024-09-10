import { ItemSettings } from '~/models';
import { Mocks } from '~/tests';
import { StoreUtility } from '~/utilities';

import * as App from '../app.actions';
import * as Actions from './items.actions';
import { initialState, itemsReducer } from './items.reducer';

describe('Items Reducer', () => {
  describe('LOAD', () => {
    it('should load item settings', () => {
      const result = itemsReducer(
        undefined,
        App.load({ partial: { itemsState: Mocks.ItemsState } }),
      );
      expect(result).toEqual(Mocks.ItemsState);
    });

    it('should handle missing partial state', () => {
      const result = itemsReducer(undefined, App.load({ partial: {} }));
      expect(result).toEqual(initialState);
    });
  });

  describe('RESET', () => {
    it('should return the initial state', () => {
      const result = itemsReducer(undefined, App.reset());
      expect(result).toEqual(initialState);
    });
  });

  describe('SET_BELT', () => {
    it('should set the belt', () => {
      const result = itemsReducer(
        initialState,
        Actions.setBelt({
          id: Mocks.Item1.id,
          value: Mocks.Item1.id,
          def: undefined,
        }),
      );
      expect(result[Mocks.Item1.id].beltId).toEqual(Mocks.Item1.id);
    });
  });

  describe('SET_WAGON', () => {
    it('should set the wagon', () => {
      const result = itemsReducer(
        initialState,
        Actions.setWagon({
          id: Mocks.Item1.id,
          value: Mocks.Item1.id,
          def: undefined,
        }),
      );
      expect(result[Mocks.Item1.id].wagonId).toEqual(Mocks.Item1.id);
    });
  });

  describe('RESET_ITEM', () => {
    it('should reset an item', () => {
      const result = itemsReducer(
        initialState,
        Actions.resetItem({ id: Mocks.Item1.id }),
      );
      expect(result[Mocks.Item1.id]).toBeUndefined();
    });
  });

  describe('RESET_BELTS', () => {
    it('should call resetField', () => {
      spyOn(StoreUtility, 'resetField');
      itemsReducer(undefined, Actions.resetBelts());
      expect(StoreUtility.resetField<ItemSettings>).toHaveBeenCalledWith(
        {},
        'beltId',
      );
    });
  });

  describe('RESET_WAGONS', () => {
    it('should call resetField', () => {
      spyOn(StoreUtility, 'resetField');
      itemsReducer(undefined, Actions.resetWagons());
      expect(StoreUtility.resetField<ItemSettings>).toHaveBeenCalledWith(
        {},
        'wagonId',
      );
    });
  });

  it('should return the default state', () => {
    expect(itemsReducer(undefined, { type: 'Test' } as any)).toBe(initialState);
  });
});

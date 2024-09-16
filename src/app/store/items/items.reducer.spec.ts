import { ItemSettings } from '~/models/settings/item-settings';
import { Mocks } from '~/tests';
import { StoreUtility } from '~/utilities/store.utility';

import { load, reset } from '../app.actions';
import {
  resetBelts,
  resetItem,
  resetWagons,
  setBelt,
  setWagon,
} from './items.actions';
import { initialItemsState, itemsReducer } from './items.reducer';

describe('Items Reducer', () => {
  describe('LOAD', () => {
    it('should load item settings', () => {
      const result = itemsReducer(
        undefined,
        load({ partial: { itemsState: Mocks.itemsState } }),
      );
      expect(result).toEqual(Mocks.itemsState);
    });

    it('should handle missing partial state', () => {
      const result = itemsReducer(undefined, load({ partial: {} }));
      expect(result).toEqual(initialItemsState);
    });
  });

  describe('RESET', () => {
    it('should return the initial state', () => {
      const result = itemsReducer(undefined, reset());
      expect(result).toEqual(initialItemsState);
    });
  });

  describe('SET_BELT', () => {
    it('should set the belt', () => {
      const result = itemsReducer(
        initialItemsState,
        setBelt({
          id: Mocks.item1.id,
          value: Mocks.item1.id,
          def: undefined,
        }),
      );
      expect(result[Mocks.item1.id].beltId).toEqual(Mocks.item1.id);
    });
  });

  describe('SET_WAGON', () => {
    it('should set the wagon', () => {
      const result = itemsReducer(
        initialItemsState,
        setWagon({
          id: Mocks.item1.id,
          value: Mocks.item1.id,
          def: undefined,
        }),
      );
      expect(result[Mocks.item1.id].wagonId).toEqual(Mocks.item1.id);
    });
  });

  describe('RESET_ITEM', () => {
    it('should reset an item', () => {
      const result = itemsReducer(
        initialItemsState,
        resetItem({ id: Mocks.item1.id }),
      );
      expect(result[Mocks.item1.id]).toBeUndefined();
    });
  });

  describe('RESET_BELTS', () => {
    it('should call resetField', () => {
      spyOn(StoreUtility, 'resetField');
      itemsReducer(undefined, resetBelts());
      expect(StoreUtility.resetField<ItemSettings>).toHaveBeenCalledWith(
        {},
        'beltId',
      );
    });
  });

  describe('RESET_WAGONS', () => {
    it('should call resetField', () => {
      spyOn(StoreUtility, 'resetField');
      itemsReducer(undefined, resetWagons());
      expect(StoreUtility.resetField<ItemSettings>).toHaveBeenCalledWith(
        {},
        'wagonId',
      );
    });
  });

  it('should return the default state', () => {
    expect(itemsReducer(undefined, { type: 'Test' } as any)).toBe(
      initialItemsState,
    );
  });
});

import { ItemId, Mocks } from 'src/tests';
import { ItemSettings } from '~/models';
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

  describe('SET_EXCLUDED', () => {
    it('should set excluded state of an item', () => {
      const result = itemsReducer(
        initialState,
        Actions.setExcluded({ id: Mocks.Item1.id, value: true }),
      );
      expect(result[Mocks.Item1.id].excluded).toEqual(true);
    });

    it('should delete key if exclude = false is the only modification', () => {
      let result = itemsReducer(
        initialState,
        Actions.setExcluded({ id: Mocks.Item1.id, value: true }),
      );
      result = itemsReducer(
        result,
        Actions.setExcluded({ id: Mocks.Item1.id, value: false }),
      );
      expect(result[Mocks.Item1.id]).toBeUndefined();
    });
  });

  describe('SET_EXCLUDED_BATCH', () => {
    it('should apply multiple changes to excluded state', () => {
      const result = itemsReducer(
        initialState,
        Actions.setExcludedBatch({
          values: [
            { id: ItemId.Coal, value: true },
            { id: ItemId.IronOre, value: false },
          ],
        }),
      );
      expect(result[ItemId.Coal].excluded).toBeTrue();
      expect(result[ItemId.IronOre]).toBeUndefined();
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

  describe('SET_CHECKED', () => {
    it('should set the checked state', () => {
      const result = itemsReducer(
        initialState,
        Actions.setChecked({
          id: Mocks.Item1.id,
          value: true,
        }),
      );
      expect(result[Mocks.Item1.id].checked).toBeTrue();
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

  describe('RESET_EXCLUDED', () => {
    it('should call resetField', () => {
      spyOn(StoreUtility, 'resetField');
      itemsReducer(undefined, Actions.resetExcluded());
      expect(StoreUtility.resetField<ItemSettings>).toHaveBeenCalledWith(
        {},
        'excluded',
      );
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

  describe('RESET_CHECKED', () => {
    it('should call resetField', () => {
      spyOn(StoreUtility, 'resetField');
      itemsReducer(undefined, Actions.resetChecked());
      expect(StoreUtility.resetField<ItemSettings>).toHaveBeenCalledWith(
        {},
        'checked',
      );
    });
  });

  it('should return the default state', () => {
    expect(itemsReducer(undefined, { type: 'Test' } as any)).toBe(initialState);
  });
});

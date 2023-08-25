import { ItemId, Mocks } from 'src/tests';
import { StoreUtility } from '~/utilities';
import * as App from '../app.actions';
import * as Actions from './items.actions';
import { initialItemsState, itemsReducer } from './items.reducer';

describe('Items Reducer', () => {
  describe('LOAD', () => {
    it('should load item settings', () => {
      const result = itemsReducer(
        undefined,
        new App.LoadAction({ itemsState: Mocks.ItemsState } as any),
      );
      expect(result).toEqual(Mocks.ItemsState);
    });
  });

  describe('RESET', () => {
    it('should return the initial state', () => {
      const result = itemsReducer(undefined, new App.ResetAction());
      expect(result).toEqual(initialItemsState);
    });
  });

  describe('SET_EXCLUDED', () => {
    it('should set excluded state of an item', () => {
      const result = itemsReducer(
        initialItemsState,
        new Actions.SetExcludedAction({ id: Mocks.Item1.id, value: true }),
      );
      expect(result[Mocks.Item1.id].excluded).toEqual(true);
    });

    it('should delete key if exclude = false is the only modification', () => {
      let result = itemsReducer(
        initialItemsState,
        new Actions.SetExcludedAction({ id: Mocks.Item1.id, value: true }),
      );
      result = itemsReducer(
        result,
        new Actions.SetExcludedAction({ id: Mocks.Item1.id, value: false }),
      );
      expect(result[Mocks.Item1.id]).toBeUndefined();
    });
  });

  describe('SET_EXCLUDED_BATCH', () => {
    it('should apply multiple changes to excluded state', () => {
      const result = itemsReducer(
        initialItemsState,
        new Actions.SetExcludedBatchAction([
          { id: ItemId.Coal, value: true },
          { id: ItemId.IronOre, value: false },
        ]),
      );
      expect(result[ItemId.Coal].excluded).toBeTrue();
      expect(result[ItemId.IronOre]).toBeUndefined();
    });
  });

  describe('SET_BELT', () => {
    it('should set the belt', () => {
      const result = itemsReducer(
        initialItemsState,
        new Actions.SetBeltAction({
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
        initialItemsState,
        new Actions.SetWagonAction({
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
        initialItemsState,
        new Actions.SetCheckedAction({
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
        initialItemsState,
        new Actions.ResetItemAction(Mocks.Item1.id),
      );
      expect(result[Mocks.Item1.id]).toBeUndefined();
    });
  });

  describe('RESET_EXCLUDED', () => {
    it('should call resetField', () => {
      spyOn(StoreUtility, 'resetField');
      itemsReducer(undefined, new Actions.ResetExcludedAction());
      expect(StoreUtility.resetField).toHaveBeenCalledWith(
        {},
        'excluded' as any,
      );
    });
  });

  describe('RESET_BELTS', () => {
    it('should call resetField', () => {
      spyOn(StoreUtility, 'resetField');
      itemsReducer(undefined, new Actions.ResetBeltsAction());
      expect(StoreUtility.resetField).toHaveBeenCalledWith({}, 'beltId' as any);
    });
  });

  describe('RESET_WAGONS', () => {
    it('should call resetField', () => {
      spyOn(StoreUtility, 'resetField');
      itemsReducer(undefined, new Actions.ResetWagonsAction());
      expect(StoreUtility.resetField).toHaveBeenCalledWith(
        {},
        'wagonId' as any,
      );
    });
  });

  describe('RESET_CHECKED', () => {
    it('should call resetField', () => {
      spyOn(StoreUtility, 'resetField');
      itemsReducer(undefined, new Actions.ResetCheckedAction());
      expect(StoreUtility.resetField).toHaveBeenCalledWith(
        {},
        'checked' as any,
      );
    });
  });

  it('should return the default state', () => {
    expect(itemsReducer(undefined, { type: 'Test' } as any)).toBe(
      initialItemsState,
    );
  });
});

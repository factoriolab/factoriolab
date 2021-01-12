import { Mocks } from 'src/tests';
import { StoreUtility } from '~/utilities';
import { LoadAction, ResetAction } from '../app.actions';
import * as Actions from './items.actions';
import { itemsReducer, initialItemsState } from './items.reducer';

describe('Items Reducer', () => {
  describe('LOAD', () => {
    it('should load item settings', () => {
      const result = itemsReducer(
        undefined,
        new LoadAction({ itemsState: Mocks.ItemSettingsEntities } as any)
      );
      expect(result).toEqual(Mocks.ItemSettingsEntities);
    });
  });

  describe('RESET', () => {
    it('should return the initial state', () => {
      const result = itemsReducer(null, new ResetAction());
      expect(result).toEqual(initialItemsState);
    });
  });

  describe('IGNORE', () => {
    it('should ignore a recipe', () => {
      const result = itemsReducer(
        initialItemsState,
        new Actions.IgnoreItemAction(Mocks.Item1.id)
      );
      expect(result[Mocks.Item1.id].ignore).toEqual(true);
    });

    it('should delete key if ignore = false is the only modification', () => {
      let result = itemsReducer(
        initialItemsState,
        new Actions.IgnoreItemAction(Mocks.Item1.id)
      );
      result = itemsReducer(
        result,
        new Actions.IgnoreItemAction(Mocks.Item1.id)
      );
      expect(result[Mocks.Recipe1.id]).toBeUndefined();
    });
  });

  describe('SET_BELT', () => {
    it('should set the belt', () => {
      const result = itemsReducer(
        initialItemsState,
        new Actions.SetBeltAction({
          id: Mocks.Item1.id,
          value: Mocks.Item1.id,
          default: null,
        })
      );
      expect(result[Mocks.Recipe1.id].belt).toEqual(Mocks.Item1.id);
    });
  });

  describe('RESET_ITEM', () => {
    it('should reset an item', () => {
      const result = itemsReducer(
        initialItemsState,
        new Actions.ResetItemAction(Mocks.Item1.id)
      );
      expect(result[Mocks.Recipe1.id]).toBeUndefined();
    });
  });

  describe('RESET_IGNORE', () => {
    it('should call resetField', () => {
      spyOn(StoreUtility, 'resetField');
      itemsReducer(null, new Actions.ResetIgnoreAction());
      expect(StoreUtility.resetField).toHaveBeenCalledWith(null, 'ignore');
    });
  });

  describe('RESET_BELT', () => {
    it('should call resetField', () => {
      spyOn(StoreUtility, 'resetField');
      itemsReducer(null, new Actions.ResetBeltAction());
      expect(StoreUtility.resetField).toHaveBeenCalledWith(null, 'belt');
    });
  });

  it('should return the default state', () => {
    expect(itemsReducer(undefined, { type: 'Test' } as any)).toBe(
      initialItemsState
    );
  });
});

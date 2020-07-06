import { Mocks } from 'src/tests';
import { RecipeUtility } from '~/utilities';
import * as Actions from './items.actions';
import { itemsReducer, initialItemsState } from './items.reducer';

describe('Items Reducer', () => {
  const numberValue = 2;

  describe('LOAD', () => {
    it('should load item settings', () => {
      const result = itemsReducer(
        undefined,
        new Actions.LoadAction(Mocks.ItemSettingsEntities)
      );
      expect(result).toEqual(Mocks.ItemSettingsEntities);
    });
  });

  describe('IGNORE', () => {
    it('should ignore a recipe', () => {
      const result = itemsReducer(
        initialItemsState,
        new Actions.IgnoreAction(Mocks.Item1.id)
      );
      expect(result[Mocks.Item1.id].ignore).toEqual(true);
    });

    it('should delete key if ignore = false is the only modification', () => {
      let result = itemsReducer(
        initialItemsState,
        new Actions.IgnoreAction(Mocks.Item1.id)
      );
      result = itemsReducer(result, new Actions.IgnoreAction(Mocks.Item1.id));
      expect(result[Mocks.Recipe1.id]).toBeUndefined();
    });
  });

  describe('SET_BELT', () => {
    it('should set the belt', () => {
      const result = itemsReducer(
        initialItemsState,
        new Actions.SetBeltAction({ id: Mocks.Item1.id, value: Mocks.Item1.id })
      );
      expect(result[Mocks.Recipe1.id].belt).toEqual(Mocks.Item1.id);
    });
  });

  describe('RESET', () => {
    it('should reset an item', () => {
      const result = itemsReducer(
        initialItemsState,
        new Actions.ResetAction(Mocks.Item1.id)
      );
      expect(result[Mocks.Recipe1.id]).toBeUndefined();
    });
  });

  describe('RESET_IGNORE', () => {
    it('should call resetField', () => {
      spyOn(RecipeUtility, 'resetField');
      itemsReducer(null, new Actions.ResetIgnoreAction());
      expect(RecipeUtility.resetField).toHaveBeenCalledWith(null, 'ignore');
    });
  });

  describe('RESET_BELT', () => {
    it('should call resetField', () => {
      spyOn(RecipeUtility, 'resetField');
      itemsReducer(null, new Actions.ResetBeltAction());
      expect(RecipeUtility.resetField).toHaveBeenCalledWith(null, 'belt');
    });
  });

  it('should return default state', () => {
    expect(itemsReducer(undefined, { type: 'Test' } as any)).toBe(
      initialItemsState
    );
  });
});

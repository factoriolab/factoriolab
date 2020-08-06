import { Entities, ItemSettings, ItemSettingsField } from '~/models';
import { StoreUtility } from '~/utilities';
import { AppLoadAction, AppActionType } from '../app.actions';
import { ItemsAction, ItemsActionType } from './items.actions';

export type ItemsState = Entities<ItemSettings>;

export const initialItemsState: ItemsState = {};

export function itemsReducer(
  state: ItemsState = initialItemsState,
  action: ItemsAction | AppLoadAction
): ItemsState {
  switch (action.type) {
    case AppActionType.LOAD: {
      return action.payload.itemsState ? action.payload.itemsState : state;
    }
    case ItemsActionType.IGNORE: {
      return StoreUtility.compareReset(state, ItemSettingsField.Ignore, {
        id: action.payload,
        value: !state[action.payload]?.ignore,
        default: false,
      });
    }
    case ItemsActionType.SET_BELT: {
      return StoreUtility.compareReset(
        state,
        ItemSettingsField.Belt,
        action.payload
      );
    }
    case ItemsActionType.RESET: {
      const newState = { ...state };
      delete newState[action.payload];
      return newState;
    }
    case ItemsActionType.RESET_IGNORE: {
      return StoreUtility.resetField(state, ItemSettingsField.Ignore);
    }
    case ItemsActionType.RESET_BELT: {
      return StoreUtility.resetField(state, ItemSettingsField.Belt);
    }
    default:
      return state;
  }
}

import { Entities, ItemSettings, ItemSettingsField } from '~/models';
import { StoreUtility } from '~/utilities';
import { AppActionType, AppAction } from '../app.actions';
import { SetBaseAction, SettingsActionType } from '../settings';
import { ItemsAction, ItemsActionType } from './items.actions';

export type ItemsState = Entities<ItemSettings>;

export const initialItemsState: ItemsState = {};

export function itemsReducer(
  state: ItemsState = initialItemsState,
  action: ItemsAction | AppAction | SetBaseAction
): ItemsState {
  switch (action.type) {
    case AppActionType.LOAD:
      return { ...initialItemsState, ...action.payload.itemsState };
    case AppActionType.RESET:
    case SettingsActionType.SET_BASE:
      return initialItemsState;
    case ItemsActionType.IGNORE_ITEM:
      return StoreUtility.compareReset(state, ItemSettingsField.Ignore, {
        id: action.payload,
        value: !state[action.payload]?.ignore,
        default: false,
      });
    case ItemsActionType.SET_BELT:
      return StoreUtility.compareReset(
        state,
        ItemSettingsField.Belt,
        action.payload
      );
    case ItemsActionType.SET_WAGON:
      return StoreUtility.compareReset(
        state,
        ItemSettingsField.Wagon,
        action.payload
      );
    case ItemsActionType.RESET_ITEM: {
      const newState = { ...state };
      delete newState[action.payload];
      return newState;
    }
    case ItemsActionType.RESET_IGNORE:
      return StoreUtility.resetField(state, ItemSettingsField.Ignore);
    case ItemsActionType.RESET_BELT:
      return StoreUtility.resetField(state, ItemSettingsField.Belt);
    case ItemsActionType.RESET_WAGON:
      return StoreUtility.resetField(state, ItemSettingsField.Wagon);
    default:
      return state;
  }
}

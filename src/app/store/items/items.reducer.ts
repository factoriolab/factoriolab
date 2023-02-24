import { Entities, ItemSettings } from '~/models';
import { StoreUtility } from '~/utilities';
import * as App from '../app.actions';
import * as Settings from '../settings';
import { ItemsAction, ItemsActionType } from './items.actions';

export type ItemsState = Entities<ItemSettings>;

export const initialItemsState: ItemsState = {};

export function itemsReducer(
  state: ItemsState = initialItemsState,
  action: ItemsAction | App.AppAction | Settings.SetModAction
): ItemsState {
  switch (action.type) {
    case App.AppActionType.LOAD:
      return { ...initialItemsState, ...action.payload.itemsState };
    case App.AppActionType.RESET:
    case Settings.SettingsActionType.SET_MOD:
      return initialItemsState;
    case ItemsActionType.IGNORE_ITEM:
      return StoreUtility.compareReset(state, 'ignore', {
        id: action.payload,
        value: !state[action.payload]?.ignore,
        def: false,
      });
    case ItemsActionType.SET_BELT:
      return StoreUtility.compareReset(state, 'beltId', action.payload);
    case ItemsActionType.SET_WAGON:
      return StoreUtility.compareReset(state, 'wagonId', action.payload);
    case ItemsActionType.SET_CHECKED:
      return StoreUtility.compareReset(state, 'checked', {
        id: action.payload.id,
        value: action.payload.value,
        def: false,
      });
    case ItemsActionType.RESET_ITEM: {
      const newState = { ...state };
      delete newState[action.payload];
      return newState;
    }
    case ItemsActionType.RESET_IGNORES:
      return StoreUtility.resetField(state, 'ignore');
    case ItemsActionType.RESET_BELTS:
      return StoreUtility.resetField(state, 'beltId');
    case ItemsActionType.RESET_WAGONS:
      return StoreUtility.resetField(state, 'wagonId');
    case ItemsActionType.RESET_CHECKED:
      return StoreUtility.resetField(state, 'checked');
    default:
      return state;
  }
}

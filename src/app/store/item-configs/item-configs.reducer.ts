import { Entities, ItemCfg } from '~/models';
import { StoreUtility } from '~/utilities';
import * as App from '../app.actions';
import * as Settings from '../settings';
import { ItemsCfgAction, ItemsCfgActionType } from './item-configs.actions';

export type ItemsCfgState = Entities<ItemCfg>;

export const initialItemsCfgState: ItemsCfgState = {};

export function itemsCfgReducer(
  state: ItemsCfgState = initialItemsCfgState,
  action: ItemsCfgAction | App.AppAction | Settings.SetModAction
): ItemsCfgState {
  switch (action.type) {
    case App.AppActionType.LOAD:
      return { ...initialItemsCfgState, ...action.payload.itemsCfgState };
    case App.AppActionType.RESET:
    case Settings.SettingsActionType.SET_MOD:
      return initialItemsCfgState;
    case ItemsCfgActionType.SET_EXCLUDED:
      return StoreUtility.compareReset(state, 'excluded', {
        id: action.payload.id,
        value: action.payload.value,
        def: false,
      });
    case ItemsCfgActionType.SET_EXCLUDED_BATCH: {
      state = { ...state };
      for (const entry of action.payload) {
        state = StoreUtility.compareReset(state, 'excluded', {
          id: entry.id,
          value: entry.value,
          def: false,
        });
      }

      return state;
    }
    case ItemsCfgActionType.SET_CHECKED:
      return StoreUtility.compareReset(state, 'checked', {
        id: action.payload.id,
        value: action.payload.value,
        def: false,
      });
    case ItemsCfgActionType.SET_BELT:
      return StoreUtility.compareReset(state, 'beltId', action.payload);
    case ItemsCfgActionType.SET_WAGON:
      return StoreUtility.compareReset(state, 'wagonId', action.payload);
    case ItemsCfgActionType.RESET_ITEM: {
      const newState = { ...state };
      delete newState[action.payload];
      return newState;
    }
    case ItemsCfgActionType.RESET_EXCLUDED:
      return StoreUtility.resetField(state, 'excluded');
    case ItemsCfgActionType.RESET_CHECKED:
      return StoreUtility.resetField(state, 'checked');
    case ItemsCfgActionType.RESET_BELTS:
      return StoreUtility.resetField(state, 'beltId');
    case ItemsCfgActionType.RESET_WAGONS:
      return StoreUtility.resetField(state, 'wagonId');
    default:
      return state;
  }
}

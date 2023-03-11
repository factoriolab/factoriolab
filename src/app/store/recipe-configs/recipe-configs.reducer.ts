import { Entities, IdDefaultPayload, RecipeCfg } from '~/models';
import { StoreUtility } from '~/utilities';
import * as App from '../app.actions';
import * as ItemsCfg from '../item-configs';
import * as Settings from '../settings';
import {
  RecipesCfgAction,
  RecipesCfgActionType,
} from './recipe-configs.actions';

export type RecipesCfgState = Entities<RecipeCfg>;

export const initialRecipesCfgState: RecipesCfgState = {};

export function recipesCfgReducer(
  state: RecipesCfgState = initialRecipesCfgState,
  action:
    | RecipesCfgAction
    | App.AppAction
    | Settings.SetModAction
    | ItemsCfg.ResetCheckedAction
): RecipesCfgState {
  switch (action.type) {
    case App.AppActionType.LOAD:
      return { ...initialRecipesCfgState, ...action.payload.recipesCfgState };
    case App.AppActionType.RESET:
    case Settings.SettingsActionType.SET_MOD:
      return initialRecipesCfgState;
    case RecipesCfgActionType.SET_EXCLUDED:
      return StoreUtility.compareReset(state, 'excluded', action.payload);
    case RecipesCfgActionType.SET_EXCLUDED_BATCH: {
      state = { ...state };
      for (const entry of action.payload) {
        state = StoreUtility.compareReset(state, 'excluded', entry);
      }

      return state;
    }
    case RecipesCfgActionType.SET_CHECKED:
      return StoreUtility.compareReset(state, 'checked', {
        id: action.payload.id,
        value: action.payload.value,
        def: false,
      });
    case RecipesCfgActionType.SET_MACHINE:
      return StoreUtility.resetFields(
        StoreUtility.compareReset(state, 'machineId', action.payload),
        ['machineModuleIds', 'beacons'],
        action.payload.id
      );
    case RecipesCfgActionType.SET_MACHINE_MODULES:
      return StoreUtility.compareReset(
        state,
        'machineModuleIds',
        action.payload
      );
    case RecipesCfgActionType.ADD_BEACON:
      return {
        ...state,
        ...{
          [action.payload]: {
            ...(state[action.payload] ?? {}),
            ...{
              beacons: [...(state[action.payload]?.beacons ?? [{}]), {}],
            },
          },
        },
      };
    case RecipesCfgActionType.REMOVE_BEACON:
      return {
        ...state,
        ...{
          [action.payload.id]: {
            ...state[action.payload.id],
            ...{
              beacons: (state[action.payload.id].beacons ?? [{}]).filter(
                (v, i) => i !== action.payload.value
              ),
            },
          },
        },
      };
    case RecipesCfgActionType.SET_BEACON_COUNT:
      return StoreUtility.compareResetIndex(
        state,
        'beacons',
        'count',
        action.payload
      );
    case RecipesCfgActionType.SET_BEACON:
      return StoreUtility.resetFieldIndex(
        StoreUtility.compareResetIndex(state, 'beacons', 'id', action.payload),
        'beacons',
        'moduleIds',
        action.payload.index,
        action.payload.id
      );
    case RecipesCfgActionType.SET_BEACON_MODULES:
      return StoreUtility.compareResetIndex(
        state,
        'beacons',
        'moduleIds',
        action.payload,
        true
      );
    case RecipesCfgActionType.SET_BEACON_TOTAL:
      return StoreUtility.assignIndexValue(
        state,
        'beacons',
        'total',
        action.payload
      );
    case RecipesCfgActionType.SET_OVERCLOCK:
      return StoreUtility.compareReset(state, 'overclock', action.payload);
    case RecipesCfgActionType.SET_COST:
      return StoreUtility.compareReset(
        state,
        'cost',
        action.payload as IdDefaultPayload
      );
    case RecipesCfgActionType.RESET_RECIPE: {
      const newState = { ...state };
      delete newState[action.payload];
      return newState;
    }
    case RecipesCfgActionType.RESET_RECIPE_MODULES:
      return StoreUtility.resetFields(
        state,
        ['machineModuleIds', 'beacons'],
        action.payload
      );
    case RecipesCfgActionType.RESET_MACHINES:
      return StoreUtility.resetFields(state, [
        'machineId',
        'overclock',
        'machineModuleIds',
        'beacons',
      ]);
    case ItemsCfg.ItemsCfgActionType.RESET_CHECKED:
      return StoreUtility.resetField(state, 'checked');
    case RecipesCfgActionType.RESET_EXCLUDED:
      return StoreUtility.resetField(state, 'excluded');
    case RecipesCfgActionType.RESET_BEACONS:
      return StoreUtility.resetField(state, 'beacons');
    case RecipesCfgActionType.RESET_COST:
      return StoreUtility.resetField(state, 'cost');
    default:
      return state;
  }
}

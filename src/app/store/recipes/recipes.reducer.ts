import { DefaultIdPayload, Entities, RecipeSettings } from '~/models';
import { StoreUtility } from '~/utilities';
import * as App from '../app.actions';
import * as Settings from '../settings';
import { RecipesAction, RecipesActionType } from './recipes.actions';

export type RecipesState = Entities<RecipeSettings>;

export const initialRecipesState: RecipesState = {};

export function recipesReducer(
  state: RecipesState = initialRecipesState,
  action: RecipesAction | App.AppAction | Settings.SetModAction
): RecipesState {
  switch (action.type) {
    case App.AppActionType.LOAD:
      return { ...initialRecipesState, ...action.payload.recipesState };
    case App.AppActionType.RESET:
    case Settings.SettingsActionType.SET_MOD:
      return initialRecipesState;
    case RecipesActionType.SET_FACTORY:
      return StoreUtility.resetFields(
        StoreUtility.compareReset(state, 'factoryId', action.payload),
        ['factoryModuleIds', 'beaconCount', 'beaconId', 'beaconModuleIds'],
        action.payload.id
      );
    case RecipesActionType.SET_FACTORY_MODULES:
      return StoreUtility.compareReset(
        state,
        'factoryModuleIds',
        action.payload
      );
    case RecipesActionType.SET_BEACON_COUNT:
      return StoreUtility.compareReset(state, 'beaconCount', action.payload);
    case RecipesActionType.SET_BEACON:
      return StoreUtility.resetField(
        StoreUtility.compareReset(state, 'beaconId', action.payload),
        'beaconModuleIds',
        action.payload.id
      );
    case RecipesActionType.SET_BEACON_MODULES:
      return StoreUtility.compareReset(
        state,
        'beaconModuleIds',
        action.payload
      );
    case RecipesActionType.SET_BEACON_TOTAL:
      return StoreUtility.assignValue(state, 'beaconTotal', action.payload);
    case RecipesActionType.SET_OVERCLOCK:
      return StoreUtility.compareReset(state, 'overclock', action.payload);
    case RecipesActionType.SET_COST:
      return StoreUtility.compareReset(
        state,
        'cost',
        action.payload as DefaultIdPayload
      );
    case RecipesActionType.RESET_RECIPE: {
      const newState = { ...state };
      delete newState[action.payload];
      return newState;
    }
    case RecipesActionType.RESET_RECIPE_MODULES:
      return StoreUtility.resetFields(
        state,
        [
          'factoryModuleIds',
          'beaconCount',
          'beaconId',
          'beaconModuleIds',
          'beaconTotal',
        ],
        action.payload
      );
    case RecipesActionType.RESET_FACTORY:
      return StoreUtility.resetFields(state, [
        'factoryId',
        'factoryModuleIds',
        'beaconCount',
        'beaconId',
        'beaconModuleIds',
        'beaconTotal',
      ]);
    case RecipesActionType.RESET_BEACONS:
      return StoreUtility.resetFields(state, [
        'beaconCount',
        'beaconId',
        'beaconModuleIds',
        'beaconTotal',
      ]);
    case RecipesActionType.RESET_OVERCLOCK:
      return StoreUtility.resetFields(state, ['overclock']);
    case RecipesActionType.RESET_COST:
      return StoreUtility.resetFields(state, ['cost']);
    default:
      return state;
  }
}

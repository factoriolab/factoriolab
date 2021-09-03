import { Entities, RecipeSettings, RecipeSettingsField } from '~/models';
import { StoreUtility } from '~/utilities';
import { AppActionType, AppAction } from '../app.actions';
import { SetBaseAction, SettingsActionType } from '../settings';
import { RecipesAction, RecipesActionType } from './recipes.actions';

export type RecipesState = Entities<RecipeSettings>;

export const initialRecipesState: RecipesState = {};

export function recipesReducer(
  state: RecipesState = initialRecipesState,
  action: RecipesAction | AppAction | SetBaseAction
): RecipesState {
  switch (action.type) {
    case AppActionType.LOAD:
      return { ...initialRecipesState, ...action.payload.recipesState };
    case AppActionType.RESET:
    case SettingsActionType.SET_BASE:
      return initialRecipesState;
    case RecipesActionType.SET_FACTORY:
      return StoreUtility.resetFields(
        StoreUtility.compareReset(
          state,
          RecipeSettingsField.Factory,
          action.payload
        ),
        [
          RecipeSettingsField.FactoryModules,
          RecipeSettingsField.BeaconCount,
          RecipeSettingsField.Beacon,
          RecipeSettingsField.BeaconModules,
        ],
        action.payload.id
      );
    case RecipesActionType.SET_FACTORY_MODULES:
      return StoreUtility.compareReset(
        state,
        RecipeSettingsField.FactoryModules,
        action.payload
      );
    case RecipesActionType.SET_BEACON_COUNT:
      return StoreUtility.compareReset(
        state,
        RecipeSettingsField.BeaconCount,
        action.payload
      );
    case RecipesActionType.SET_BEACON:
      return StoreUtility.resetField(
        StoreUtility.compareReset(
          state,
          RecipeSettingsField.Beacon,
          action.payload
        ),
        RecipeSettingsField.BeaconModules,
        action.payload.id
      );
    case RecipesActionType.SET_BEACON_MODULES:
      return StoreUtility.compareReset(
        state,
        RecipeSettingsField.BeaconModules,
        action.payload
      );
    case RecipesActionType.SET_BEACON_TOTAL:
      return StoreUtility.assignValue(
        state,
        RecipeSettingsField.BeaconTotal,
        action.payload
      );
    case RecipesActionType.SET_OVERCLOCK:
      return StoreUtility.compareReset(
        state,
        RecipeSettingsField.Overclock,
        action.payload
      );
    case RecipesActionType.SET_COST:
      return StoreUtility.compareReset(
        state,
        RecipeSettingsField.Cost,
        action.payload
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
          RecipeSettingsField.FactoryModules,
          RecipeSettingsField.BeaconCount,
          RecipeSettingsField.Beacon,
          RecipeSettingsField.BeaconModules,
          RecipeSettingsField.BeaconTotal,
        ],
        action.payload
      );
    case RecipesActionType.RESET_FACTORY:
      return StoreUtility.resetFields(state, [
        RecipeSettingsField.Factory,
        RecipeSettingsField.FactoryModules,
        RecipeSettingsField.BeaconCount,
        RecipeSettingsField.Beacon,
        RecipeSettingsField.BeaconModules,
        RecipeSettingsField.BeaconTotal,
      ]);
    case RecipesActionType.RESET_BEACONS:
      return StoreUtility.resetFields(state, [
        RecipeSettingsField.BeaconCount,
        RecipeSettingsField.Beacon,
        RecipeSettingsField.BeaconModules,
        RecipeSettingsField.BeaconTotal,
      ]);
    case RecipesActionType.RESET_OVERCLOCK:
      return StoreUtility.resetFields(state, [RecipeSettingsField.Overclock]);
    case RecipesActionType.RESET_COST:
      return StoreUtility.resetFields(state, [RecipeSettingsField.Cost]);
    default:
      return state;
  }
}

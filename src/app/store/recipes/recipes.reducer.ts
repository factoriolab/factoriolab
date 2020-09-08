import { Entities, RecipeSettings, RecipeSettingsField } from '~/models';
import { StoreUtility } from '~/utilities';
import { AppLoadAction, AppActionType } from '../app.actions';
import { RecipesAction, RecipesActionType } from './recipes.actions';

export type RecipesState = Entities<RecipeSettings>;

export const initialRecipesState: RecipesState = {};

export function recipesReducer(
  state: RecipesState = initialRecipesState,
  action: RecipesAction | AppLoadAction
): RecipesState {
  switch (action.type) {
    case AppActionType.LOAD: {
      return action.payload.recipesState ? action.payload.recipesState : state;
    }
    case RecipesActionType.SET_FACTORY: {
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
        ]
      );
    }
    case RecipesActionType.SET_FACTORY_MODULES: {
      return StoreUtility.compareReset(
        state,
        RecipeSettingsField.FactoryModules,
        action.payload
      );
    }
    case RecipesActionType.SET_BEACONS_COUNT: {
      return StoreUtility.compareReset(
        state,
        RecipeSettingsField.BeaconCount,
        action.payload
      );
    }
    case RecipesActionType.SET_BEACON: {
      return StoreUtility.resetField(
        StoreUtility.compareReset(
          state,
          RecipeSettingsField.Beacon,
          action.payload
        ),
        RecipeSettingsField.BeaconModules
      );
    }
    case RecipesActionType.SET_BEACON_MODULES: {
      return StoreUtility.compareReset(
        state,
        RecipeSettingsField.BeaconModules,
        action.payload
      );
    }
    case RecipesActionType.RESET: {
      const newState = { ...state };
      delete newState[action.payload];
      return newState;
    }
    case RecipesActionType.RESET_FACTORY: {
      return StoreUtility.resetFields(state, [
        RecipeSettingsField.Factory,
        RecipeSettingsField.FactoryModules,
      ]);
    }
    case RecipesActionType.RESET_BEACONS: {
      return StoreUtility.resetFields(state, [
        RecipeSettingsField.BeaconCount,
        RecipeSettingsField.Beacon,
        RecipeSettingsField.BeaconModules,
      ]);
    }
    default:
      return state;
  }
}

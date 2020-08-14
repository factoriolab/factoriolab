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
      return StoreUtility.compareReset(
        state,
        RecipeSettingsField.Factory,
        action.payload
      );
    }
    case RecipesActionType.SET_MODULES: {
      return StoreUtility.compareReset(
        state,
        RecipeSettingsField.Modules,
        action.payload
      );
    }
    case RecipesActionType.SET_BEACON_MODULE: {
      return StoreUtility.compareReset(
        state,
        RecipeSettingsField.BeaconModule,
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
    case RecipesActionType.RESET: {
      const newState = { ...state };
      delete newState[action.payload];
      return newState;
    }
    case RecipesActionType.RESET_FACTORY: {
      return StoreUtility.resetField(state, RecipeSettingsField.Factory);
    }
    case RecipesActionType.RESET_MODULES: {
      return StoreUtility.resetField(state, RecipeSettingsField.Modules);
    }
    case RecipesActionType.RESET_BEACONS: {
      return StoreUtility.resetField(
        StoreUtility.resetField(state, RecipeSettingsField.BeaconModule),
        RecipeSettingsField.BeaconCount
      );
    }
    default:
      return state;
  }
}

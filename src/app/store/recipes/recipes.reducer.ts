import { Entities, RecipeSettings } from '~/models';
import { RecipeUtility } from '~/utilities';
import { RecipesAction, RecipesActionType } from './recipes.actions';

export type RecipesState = Entities<RecipeSettings>;

export const initialRecipeState: RecipesState = {};

export function recipeReducer(
  state: RecipesState = initialRecipeState,
  action: RecipesAction
): RecipesState {
  switch (action.type) {
    case RecipesActionType.LOAD: {
      return action.payload;
    }
    case RecipesActionType.SET_FACTORY: {
      const id = action.payload[0];
      return {
        ...state,
        ...{ [id]: { ...state[id], ...{ factory: action.payload[1] } } },
      };
    }
    case RecipesActionType.SET_MODULES: {
      const id = action.payload[0];
      return {
        ...state,
        ...{ [id]: { ...state[id], ...{ modules: action.payload[1] } } },
      };
    }
    case RecipesActionType.SET_BEACON_MODULE: {
      const id = action.payload[0];
      return {
        ...state,
        ...{ [id]: { ...state[id], ...{ beaconModule: action.payload[1] } } },
      };
    }
    case RecipesActionType.SET_BEACONS_COUNT: {
      const id = action.payload[0];
      return {
        ...state,
        ...{ [id]: { ...state[id], ...{ beaconCount: action.payload[1] } } },
      };
    }
    case RecipesActionType.RESET: {
      const newState = { ...state };
      delete newState[action.payload];
      return newState;
    }
    case RecipesActionType.RESET_FACTORY: {
      return RecipeUtility.resetField(state, 'factory');
    }
    case RecipesActionType.RESET_MODULES: {
      return RecipeUtility.resetField(state, 'modules');
    }
    case RecipesActionType.RESET_BEACONS: {
      return RecipeUtility.resetField(
        RecipeUtility.resetField(state, 'beaconModule'),
        'beaconCount'
      );
    }
    default:
      return state;
  }
}

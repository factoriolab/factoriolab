import { Entities, RecipeSettings } from '~/models';
import { RecipeUtility } from '~/utilities';
import { RecipesAction, RecipesActionType } from './recipes.actions';

export type RecipesState = Entities<RecipeSettings>;

export const initialRecipesState: RecipesState = {};

export function recipesReducer(
  state: RecipesState = initialRecipesState,
  action: RecipesAction
): RecipesState {
  switch (action.type) {
    case RecipesActionType.LOAD: {
      return action.payload;
    }
    case RecipesActionType.SET_FACTORY: {
      const id = action.payload.id;
      return {
        ...state,
        ...{ [id]: { ...state[id], ...{ factory: action.payload.value } } },
      };
    }
    case RecipesActionType.SET_MODULES: {
      const id = action.payload.id;
      return {
        ...state,
        ...{ [id]: { ...state[id], ...{ modules: action.payload.value } } },
      };
    }
    case RecipesActionType.SET_BEACON_MODULE: {
      const id = action.payload.id;
      return {
        ...state,
        ...{
          [id]: { ...state[id], ...{ beaconModule: action.payload.value } },
        },
      };
    }
    case RecipesActionType.SET_BEACONS_COUNT: {
      const id = action.payload.id;
      return {
        ...state,
        ...{ [id]: { ...state[id], ...{ beaconCount: action.payload.value } } },
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

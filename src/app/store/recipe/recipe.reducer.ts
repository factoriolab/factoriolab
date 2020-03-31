import { RecipeAction, RecipeActionType } from './recipe.actions';
import { RecipeSettings } from 'src/app/models';

export interface RecipeState {
  [id: string]: RecipeSettings;
}

export const initialRecipeState: RecipeState = {};

export function recipeReducer(
  state: RecipeState = initialRecipeState,
  action: RecipeAction
): RecipeState {
  switch (action.type) {
    case RecipeActionType.IGNORE_RECIPE: {
      if (state[action.payload]) {
        return {
          ...state,
          ...{
            [action.payload]: { ...state[action.payload], ...{ ignore: true } }
          }
        };
      } else {
        return { ...state, ...{ [action.payload]: { ignore: true } } };
      }
    }
    case RecipeActionType.EDIT_BEACON_TYPE: {
      const id = action.payload[0];
      return {
        ...state,
        ...{ [id]: { ...state[id], ...{ beaconType: action.payload[1] } } }
      };
    }
    case RecipeActionType.EDIT_BEACONS_COUNT: {
      const id = action.payload[0];
      return {
        ...state,
        ...{ [id]: { ...state[id], ...{ beaconCount: action.payload[1] } } }
      };
    }
    default:
      return state;
  }
}

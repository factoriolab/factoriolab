import { Entities, RecipeSettings } from '~/models';
import { RecipeAction, RecipeActionType } from './recipe.actions';

export type RecipeState = Entities<RecipeSettings>;

export const initialRecipeState: RecipeState = {};

export function recipeReducer(
  state: RecipeState = initialRecipeState,
  action: RecipeAction
): RecipeState {
  switch (action.type) {
    case RecipeActionType.LOAD: {
      return action.payload;
    }
    case RecipeActionType.IGNORE: {
      return {
        ...state,
        ...{
          [action.payload]: { ...state[action.payload], ...{ ignore: true } },
        },
      };
    }
    case RecipeActionType.EDIT_BEACON_TYPE: {
      const id = action.payload[0];
      return {
        ...state,
        ...{ [id]: { ...state[id], ...{ beaconType: action.payload[1] } } },
      };
    }
    case RecipeActionType.EDIT_BEACONS_COUNT: {
      const id = action.payload[0];
      return {
        ...state,
        ...{ [id]: { ...state[id], ...{ beaconCount: action.payload[1] } } },
      };
    }
    default:
      return state;
  }
}

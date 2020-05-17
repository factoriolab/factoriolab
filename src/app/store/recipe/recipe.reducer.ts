import { Entities, RecipeSettings } from '~/models';
import { RecipeUtility } from '~/utilities';
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
      let newState = {
        ...state,
        ...{
          [action.payload]: {
            ...state[action.payload],
            ...{
              ignore: state[action.payload]
                ? !state[action.payload].ignore
                : true,
            },
          },
        },
      };
      if (
        newState[action.payload].ignore === false &&
        Object.keys(newState[action.payload]).length === 1
      ) {
        // Delete key if ignore = false is only setting
        newState = { ...state };
        delete newState[action.payload];
        return newState;
      }
      return newState;
    }
    case RecipeActionType.SET_BELT: {
      const id = action.payload[0];
      return {
        ...state,
        ...{ [id]: { ...state[id], ...{ belt: action.payload[1] } } },
      };
    }
    case RecipeActionType.SET_FACTORY: {
      const id = action.payload[0];
      return {
        ...state,
        ...{ [id]: { ...state[id], ...{ factory: action.payload[1] } } },
      };
    }
    case RecipeActionType.SET_MODULES: {
      const id = action.payload[0];
      return {
        ...state,
        ...{ [id]: { ...state[id], ...{ modules: action.payload[1] } } },
      };
    }
    case RecipeActionType.SET_BEACON_MODULE: {
      const id = action.payload[0];
      return {
        ...state,
        ...{ [id]: { ...state[id], ...{ beaconModule: action.payload[1] } } },
      };
    }
    case RecipeActionType.SET_BEACONS_COUNT: {
      const id = action.payload[0];
      return {
        ...state,
        ...{ [id]: { ...state[id], ...{ beaconCount: action.payload[1] } } },
      };
    }
    case RecipeActionType.RESET: {
      const newState = { ...state };
      delete newState[action.payload];
      return newState;
    }
    case RecipeActionType.RESET_IGNORE: {
      return RecipeUtility.resetField(state, 'ignore');
    }
    case RecipeActionType.RESET_BELT: {
      return RecipeUtility.resetField(state, 'belt');
    }
    case RecipeActionType.RESET_FACTORY: {
      return RecipeUtility.resetField(state, 'factory');
    }
    case RecipeActionType.RESET_MODULES: {
      return RecipeUtility.resetField(state, 'modules');
    }
    case RecipeActionType.RESET_BEACONS: {
      return RecipeUtility.resetField(
        RecipeUtility.resetField(state, 'beaconModule'),
        'beaconCount'
      );
    }
    default:
      return state;
  }
}

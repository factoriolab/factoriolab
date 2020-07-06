import { Entities, ItemSettings } from '~/models';
import { RecipeUtility } from '~/utilities';
import { ItemsAction, ItemsActionType } from './items.actions';

export type ItemsState = Entities<ItemSettings>;

export const initialItemsState: ItemsState = {};

export function itemsReducer(
  state: ItemsState = initialItemsState,
  action: ItemsAction
): ItemsState {
  switch (action.type) {
    case ItemsActionType.LOAD: {
      return action.payload;
    }
    case ItemsActionType.IGNORE: {
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
    case ItemsActionType.SET_BELT: {
      const id = action.payload.id;
      return {
        ...state,
        ...{ [id]: { ...state[id], ...{ belt: action.payload.value } } },
      };
    }
    case ItemsActionType.RESET: {
      const newState = { ...state };
      delete newState[action.payload];
      return newState;
    }
    case ItemsActionType.RESET_IGNORE: {
      return RecipeUtility.resetField(state, 'ignore');
    }
    case ItemsActionType.RESET_BELT: {
      return RecipeUtility.resetField(state, 'belt');
    }
    default:
      return state;
  }
}

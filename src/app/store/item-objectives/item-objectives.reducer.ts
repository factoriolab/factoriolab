import { AmountType, Entities, ItemObjective, Rational } from '~/models';
import { StoreUtility } from '~/utilities';
import * as App from '../app.actions';
import * as Settings from '../settings';
import {
  ItemObjectivesAction,
  ItemObjectivesActionType,
} from './item-objectives.actions';

export interface ItemObjectivesState {
  ids: string[];
  entities: Entities<ItemObjective>;
  index: number;
}

export const initialItemObjectivesState: ItemObjectivesState = {
  ids: [],
  entities: {},
  index: 0,
};

export function itemObjectivesReducer(
  state: ItemObjectivesState = initialItemObjectivesState,
  action: ItemObjectivesAction | App.AppAction | Settings.SetModAction
): ItemObjectivesState {
  switch (action.type) {
    case App.AppActionType.LOAD:
      return action.payload.itemObjectivesState
        ? action.payload.itemObjectivesState
        : initialItemObjectivesState;
    case App.AppActionType.RESET:
    case Settings.SettingsActionType.SET_MOD:
      return initialItemObjectivesState;
    case ItemObjectivesActionType.ADD: {
      let amount = '60';
      let amountType: AmountType = 'items';
      if (state.ids.length > 0) {
        // Use amount and amount type from last item objective in list
        const id = state.ids[state.ids.length - 1];
        amount = state.entities[id].amount;
        amountType = state.entities[id].amountType;
      }
      return {
        ...state,
        ...{
          ids: [...state.ids, state.index.toString()],
          entities: {
            ...state.entities,
            ...{
              [state.index]: {
                id: state.index.toString(),
                itemId: action.payload,
                amount,
                amountType,
              },
            },
          },
          index: state.index + 1,
        },
      };
    }
    case ItemObjectivesActionType.CREATE: {
      // Use full item objective, but enforce id: '0'
      const itemObjective = { ...action.payload, ...{ id: '0' } };
      return {
        ...state,
        ...{
          ids: [itemObjective.id],
          entities: { [itemObjective.id]: itemObjective },
          index: 1,
        },
      };
    }
    case ItemObjectivesActionType.REMOVE: {
      const newEntities = { ...state.entities };
      delete newEntities[action.payload];
      return {
        ...state,
        ...{
          ids: state.ids.filter((i) => i !== action.payload),
          entities: newEntities,
        },
      };
    }
    case ItemObjectivesActionType.SET_ITEM: {
      return {
        ...state,
        ...{
          entities: StoreUtility.assignValue(
            state.entities,
            'itemId',
            action.payload
          ),
        },
      };
    }
    case ItemObjectivesActionType.SET_AMOUNT:
      return {
        ...state,
        ...{
          entities: StoreUtility.assignValue(
            state.entities,
            'amount',
            action.payload
          ),
        },
      };
    case ItemObjectivesActionType.SET_AMOUNT_TYPE:
      return {
        ...state,
        ...{
          entities: StoreUtility.assignValue(
            state.entities,
            'amountType',
            action.payload
          ),
        },
      };
    case ItemObjectivesActionType.ADJUST_DISPLAY_RATE: {
      const factor = Rational.fromString(action.payload);
      const newEntities = { ...state.entities };
      for (const id of state.ids.filter(
        (i) =>
          state.entities[i].amountType === 'items' ||
          state.entities[i].amountType === 'wagons'
      )) {
        const amount = Rational.fromString(state.entities[id].amount)
          .mul(factor)
          .toString();
        newEntities[id] = { ...state.entities[id], ...{ amount } };
      }
      return {
        ...state,
        ...{ entities: newEntities },
      };
    }
    default:
      return state;
  }
}

import { Entities, ItemObjective, RateType, Rational } from '~/models';
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
      let rate = '60';
      let rateType: RateType = 'items';
      if (state.ids.length > 0) {
        // Use rate and rate type from last item objective in list
        const id = state.ids[state.ids.length - 1];
        rate = state.entities[id].rate;
        rateType = state.entities[id].rateType;
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
                rate,
                rateType,
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
    case ItemObjectivesActionType.SET_RATE:
      return {
        ...state,
        ...{
          entities: StoreUtility.assignValue(
            state.entities,
            'rate',
            action.payload
          ),
        },
      };
    case ItemObjectivesActionType.SET_RATE_TYPE:
      return {
        ...state,
        ...{
          entities: StoreUtility.assignValue(
            state.entities,
            'rateType',
            action.payload
          ),
        },
      };
    case ItemObjectivesActionType.ADJUST_DISPLAY_RATE: {
      const factor = Rational.fromString(action.payload);
      const newEntities = { ...state.entities };
      for (const id of state.ids.filter(
        (i) =>
          state.entities[i].rateType === 'items' ||
          state.entities[i].rateType === 'wagons'
      )) {
        const rate = Rational.fromString(state.entities[id].rate)
          .mul(factor)
          .toString();
        newEntities[id] = { ...state.entities[id], ...{ rate } };
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

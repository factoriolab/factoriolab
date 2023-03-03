import { Entities, ItemObjective, ObjectiveType, RateUnit } from '~/models';
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
      let rate = '1';
      let rateUnit = RateUnit.Items;
      if (state.ids.length > 0) {
        // Use rate and rate type from last item objective in list
        const id = state.ids[state.ids.length - 1];
        rate = state.entities[id].rate;
        rateUnit = state.entities[id].rateUnit;
      }
      const objective: ItemObjective = {
        id: state.index.toString(),
        itemId: action.payload,
        rate,
        rateUnit,
        type: ObjectiveType.Output,
      };
      return {
        ...state,
        ...{
          ids: [...state.ids, state.index.toString()],
          entities: {
            ...state.entities,
            ...{
              [state.index]: objective,
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
    case ItemObjectivesActionType.SET_RATE_UNIT:
      return {
        ...state,
        ...{
          entities: StoreUtility.assignValue(
            state.entities,
            'rateUnit',
            action.payload
          ),
        },
      };
    case ItemObjectivesActionType.SET_TYPE:
      return {
        ...state,
        ...{
          entities: StoreUtility.assignValue(
            state.entities,
            'type',
            action.payload
          ),
        },
      };
    default:
      return state;
  }
}

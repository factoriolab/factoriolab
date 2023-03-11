import { Entities, ItemObj, ObjectiveType, RateUnit, Rational } from '~/models';
import { StoreUtility } from '~/utilities';
import * as App from '../app.actions';
import * as Settings from '../settings';
import { ItemsObjAction, ItemsObjActionType } from './item-objectives.actions';

export interface ItemsObjState {
  ids: string[];
  entities: Entities<ItemObj>;
  index: number;
}

export const initialItemsObjState: ItemsObjState = {
  ids: [],
  entities: {},
  index: 0,
};

export function itemsObjReducer(
  state: ItemsObjState = initialItemsObjState,
  action: ItemsObjAction | App.AppAction | Settings.SetModAction
): ItemsObjState {
  switch (action.type) {
    case App.AppActionType.LOAD:
      return action.payload.itemsObjState
        ? action.payload.itemsObjState
        : initialItemsObjState;
    case App.AppActionType.RESET:
    case Settings.SettingsActionType.SET_MOD:
      return initialItemsObjState;
    case ItemsObjActionType.ADD: {
      let rate = '60';
      let rateUnit = RateUnit.Items;
      if (state.ids.length > 0) {
        // Use rate and rate type from last item objective in list
        const id = state.ids[state.ids.length - 1];
        rate = state.entities[id].rate;
        rateUnit = state.entities[id].rateUnit;
      }
      const objective: ItemObj = {
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
    case ItemsObjActionType.CREATE: {
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
    case ItemsObjActionType.REMOVE: {
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
    case ItemsObjActionType.SET_ITEM: {
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
    case ItemsObjActionType.SET_RATE:
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
    case ItemsObjActionType.SET_RATE_UNIT:
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
    case ItemsObjActionType.ADJUST_DISPLAY_RATE: {
      const factor = Rational.fromString(action.payload);
      const newEntities = { ...state.entities };
      for (const objective of state.ids
        .map((i) => state.entities[i])
        .filter(
          (o) =>
            o.type !== ObjectiveType.Maximize &&
            (o.rateUnit === RateUnit.Items || o.rateUnit === RateUnit.Wagons)
        )) {
        const rate = Rational.fromString(objective.rate).mul(factor).toString();
        newEntities[objective.id] = { ...objective, ...{ rate } };
      }
      return {
        ...state,
        ...{ entities: newEntities },
      };
    }
    case ItemsObjActionType.SET_TYPE:
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

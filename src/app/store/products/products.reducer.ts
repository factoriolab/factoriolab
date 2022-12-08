import { Entities, Product, RateType, Rational } from '~/models';
import { StoreUtility } from '~/utilities';
import * as App from '../app.actions';
import * as Settings from '../settings';
import { ProductsAction, ProductsActionType } from './products.actions';

export interface ProductsState {
  ids: string[];
  entities: Entities<Product>;
  index: number;
}

export const initialProductsState: ProductsState = {
  ids: [],
  entities: {},
  index: 0,
};

export function productsReducer(
  state: ProductsState = initialProductsState,
  action: ProductsAction | App.AppAction | Settings.SetModAction
): ProductsState {
  switch (action.type) {
    case App.AppActionType.LOAD:
      return action.payload.productsState
        ? action.payload.productsState
        : initialProductsState;
    case App.AppActionType.RESET:
    case Settings.SettingsActionType.SET_MOD:
      return initialProductsState;
    case ProductsActionType.ADD: {
      let rate = '60';
      let rateType = RateType.Items;
      if (state.ids.length > 0) {
        // Use rate and rate type from last product in list
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
    case ProductsActionType.CREATE: {
      // Use full product, but enforce id: '0'
      const product = { ...action.payload, ...{ id: '0' } };
      return {
        ...state,
        ...{ ids: [product.id], entities: { [product.id]: product }, index: 1 },
      };
    }
    case ProductsActionType.REMOVE: {
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
    case ProductsActionType.SET_ITEM: {
      const entities = StoreUtility.assignValue(
        state.entities,
        'itemId',
        action.payload
      );
      if (entities[action.payload.id].rateType === RateType.Factories) {
        entities[action.payload.id].rateType = RateType.Items;
      }
      return {
        ...state,
        ...{
          entities: StoreUtility.resetFields(
            entities,
            ['viaId'],
            action.payload.id
          ),
        },
      };
    }
    case ProductsActionType.SET_RATE:
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
    case ProductsActionType.SET_RATE_TYPE:
      return {
        ...state,
        ...{
          entities: StoreUtility.resetFields(
            StoreUtility.assignValue(
              state.entities,
              'rateType',
              action.payload
            ),
            ['viaId'],
            action.payload.id
          ),
        },
      };
    case ProductsActionType.SET_VIA:
      return {
        ...state,
        ...{
          entities: StoreUtility.assignValue(
            state.entities,
            'viaId',
            action.payload
          ),
        },
      };
    case ProductsActionType.RESET_VIA:
      return {
        ...state,
        ...{
          entities: StoreUtility.resetFields(
            state.entities,
            ['viaId'],
            action.payload
          ),
        },
      };
    case ProductsActionType.ADJUST_DISPLAY_RATE: {
      const factor = Rational.fromString(action.payload);
      const newEntities = { ...state.entities };
      for (const id of state.ids.filter(
        (i) =>
          state.entities[i].rateType === RateType.Items ||
          state.entities[i].rateType === RateType.Wagons
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

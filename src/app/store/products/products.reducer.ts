import { Product, RateType, Entities } from '~/models';
import { AppLoadAction, AppActionType } from '../app.actions';
import { ProductsAction, ProductsActionType } from './products.actions';

export interface ProductsState {
  ids: string[];
  entities: Entities<Product>;
  index: number;
}

const defaultProduct: Product = {
  id: '0',
  itemId: null,
  rate: 1,
  rateType: RateType.Items,
};

export const initialProductsState: ProductsState = {
  ids: [],
  entities: {},
  index: 0,
};

export function productsReducer(
  state: ProductsState = initialProductsState,
  action: ProductsAction | AppLoadAction
): ProductsState {
  switch (action.type) {
    case AppActionType.LOAD: {
      return action.payload.productsState
        ? action.payload.productsState
        : state;
    }
    case ProductsActionType.RESET: {
      return initialProductsState;
    }
    case ProductsActionType.ADD: {
      const newOutput = {
        ...defaultProduct,
        ...{ id: state.index.toString(), itemId: action.payload },
      };
      return {
        ...state,
        ...{
          ids: [...state.ids, state.index.toString()],
          entities: { ...state.entities, ...{ [state.index]: newOutput } },
          index: state.index + 1,
        },
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
    case ProductsActionType.EDIT_PRODUCT: {
      const id = action.payload.id;
      return {
        ...state,
        ...{
          editProductId: null,
          entities: {
            ...state.entities,
            ...{
              [id]: {
                ...state.entities[id],
                ...{
                  itemId: action.payload.value,
                },
              },
            },
          },
        },
      };
    }
    case ProductsActionType.EDIT_RATE: {
      const id = action.payload.id;
      return {
        ...state,
        ...{
          entities: {
            ...state.entities,
            ...{
              [id]: {
                ...state.entities[id],
                ...{
                  rate: action.payload.value,
                },
              },
            },
          },
        },
      };
    }
    case ProductsActionType.EDIT_RATE_TYPE: {
      const id = action.payload.id;
      return {
        ...state,
        ...{
          entities: {
            ...state.entities,
            ...{
              [id]: {
                ...state.entities[id],
                ...{
                  rateType: action.payload.value,
                },
              },
            },
          },
        },
      };
    }
    default:
      return state;
  }
}

import { Product, RateType, Entities } from '~/models';
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
  action: ProductsAction
): ProductsState {
  switch (action.type) {
    case ProductsActionType.LOAD: {
      const ids = action.payload.map((p) => p.id);
      const index = Math.max(...ids.map((p) => Number(p))) + 1;
      const entities = action.payload.reduce((e: Entities<Product>, i) => {
        return { ...e, ...{ [i.id]: i } };
      }, {});
      return { ...state, ...{ ids, entities, index } };
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
      const id = action.payload[0];
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
                  itemId: action.payload[1],
                },
              },
            },
          },
        },
      };
    }
    case ProductsActionType.EDIT_RATE: {
      const id = action.payload[0];
      return {
        ...state,
        ...{
          entities: {
            ...state.entities,
            ...{
              [id]: {
                ...state.entities[id],
                ...{
                  rate: action.payload[1],
                },
              },
            },
          },
        },
      };
    }
    case ProductsActionType.EDIT_RATE_TYPE: {
      const id = action.payload[0];
      return {
        ...state,
        ...{
          entities: {
            ...state.entities,
            ...{
              [id]: {
                ...state.entities[id],
                ...{
                  rateType: action.payload[1],
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

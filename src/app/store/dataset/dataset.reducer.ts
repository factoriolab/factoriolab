import { Item, Category, Recipe, Entities } from '~/models';
import { DatasetAction, DatasetActionType } from './dataset.actions';

export interface DatasetState {
  itemIds: string[];
  itemEntities: Entities<Item>;
  categoryIds: string[];
  categoryEntities: Entities<Category>;
  recipeIds: string[];
  recipeEntities: Entities<Recipe>;
}

export const initialDatasetState: DatasetState = {
  itemIds: [],
  itemEntities: {},
  categoryIds: [],
  categoryEntities: {},
  recipeIds: [],
  recipeEntities: {}
};

export function datasetReducer(
  state: DatasetState = initialDatasetState,
  action: DatasetAction
): DatasetState {
  switch (action.type) {
    case DatasetActionType.LOAD: {
      return {
        itemIds: action.payload.items.map(i => i.id),
        itemEntities: action.payload.items.reduce((e: Entities<Item>, i) => {
          return { ...e, ...{ [i.id]: i } };
        }, {}),
        categoryIds: action.payload.categories.map(c => c.id),
        categoryEntities: action.payload.categories.reduce(
          (e: Entities<Category>, c) => {
            return { ...e, ...{ [c.id]: c } };
          },
          {}
        ),
        recipeIds: action.payload.recipes.map(r => r.id),
        recipeEntities: action.payload.recipes.reduce(
          (e: Entities<Recipe>, r) => {
            return { ...e, ...{ [r.id]: r } };
          },
          {}
        )
      };
    }
    default:
      return state;
  }
}

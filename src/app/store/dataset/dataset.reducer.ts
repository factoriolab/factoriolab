import { Item, Category, Recipe, Entities } from '~/models';
import { DatasetAction, DatasetActionType } from './dataset.actions';

export interface DatasetState {
  items: Item[];
  itemIds: string[];
  itemEntities: Entities<Item>;
  categories: Category[];
  categoryIds: string[];
  categoryEntities: Entities<Category>;
  recipes: Recipe[];
  recipeIds: string[];
  recipeEntities: Entities<Recipe>;
}

export const initialDatasetState: DatasetState = {
  items: [],
  itemIds: [],
  itemEntities: {},
  categories: [],
  categoryIds: [],
  categoryEntities: {},
  recipes: [],
  recipeIds: [],
  recipeEntities: {},
};

export function datasetReducer(
  state: DatasetState = initialDatasetState,
  action: DatasetAction
): DatasetState {
  switch (action.type) {
    case DatasetActionType.LOAD: {
      return {
        items: action.payload.items,
        itemIds: action.payload.items.map((i) => i.id),
        itemEntities: action.payload.items.reduce((e: Entities<Item>, i) => {
          return { ...e, ...{ [i.id]: i } };
        }, {}),
        categories: action.payload.categories,
        categoryIds: action.payload.categories.map((c) => c.id),
        categoryEntities: action.payload.categories.reduce(
          (e: Entities<Category>, c) => {
            return { ...e, ...{ [c.id]: c } };
          },
          {}
        ),
        recipes: action.payload.recipes,
        recipeIds: action.payload.recipes.map((r) => r.id),
        recipeEntities: action.payload.recipes.reduce(
          (e: Entities<Recipe>, r) => {
            return { ...e, ...{ [r.id]: r } };
          },
          {}
        ),
      };
    }
    default:
      return state;
  }
}

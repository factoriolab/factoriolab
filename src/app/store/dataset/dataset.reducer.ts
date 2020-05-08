import { Item, Category, Recipe, Entities, ItemId, NEntities } from '~/models';
import { DatasetAction, DatasetActionType } from './dataset.actions';

export interface DatasetState {
  items: Item[];
  itemIds: string[];
  itemEntities: Entities<Item>;
  itemN: Entities<number>;
  itemI: NEntities<string>;
  beltIds: ItemId[];
  categories: Category[];
  categoryIds: string[];
  categoryEntities: Entities<Category>;
  categoryItemRows: Entities<string[][]>;
  recipes: Recipe[];
  recipeIds: string[];
  recipeEntities: Entities<Recipe>;
  recipeN: Entities<number>;
  recipeI: NEntities<string>;
}

export const initialDatasetState: DatasetState = {
  items: [],
  itemIds: [],
  itemEntities: {},
  itemN: {},
  itemI: {},
  beltIds: [],
  categories: [],
  categoryIds: [],
  categoryEntities: {},
  categoryItemRows: {},
  recipes: [],
  recipeIds: [],
  recipeEntities: {},
  recipeN: {},
  recipeI: {},
};

export function datasetReducer(
  state: DatasetState = initialDatasetState,
  action: DatasetAction
): DatasetState {
  switch (action.type) {
    case DatasetActionType.LOAD: {
      const categoryItemRows: Entities<string[][]> = {};

      for (const category of action.payload.categories) {
        const rows: string[][] = [[]];
        const items = action.payload.items
          .filter((p) => p.category === category.id)
          .sort((a, b) => a.row - b.row);
        let index = items[0].row;
        for (const item of items) {
          if (item.row > index) {
            rows.push([]);
            index = item.row;
          }
          rows[rows.length - 1].push(item.id);
        }
        categoryItemRows[category.id] = rows;
      }

      const itemEntities = action.payload.items.reduce(
        (e: Entities<Item>, i) => {
          return { ...e, ...{ [i.id]: i } };
        },
        {}
      );

      // Fill in missing recipe names
      const recipes: Recipe[] = [];
      for (const recipe of action.payload.recipes) {
        if (!recipe.name) {
          recipes.push({
            ...recipe,
            ...{ name: itemEntities[recipe.id].name },
          });
        } else {
          recipes.push(recipe);
        }
      }

      return {
        items: action.payload.items,
        itemIds: action.payload.items.map((i) => i.id),
        itemEntities,
        itemN: action.payload.items.reduce((e: Entities<number>, i, z) => {
          return { ...e, ...{ [i.id]: z } };
        }, {}),
        itemI: action.payload.items.reduce((e: NEntities<string>, i, z) => {
          return { ...e, ...{ [z]: i.id } };
        }, {}),
        beltIds: action.payload.items
          .filter((i) => i.belt || i.id === ItemId.Pipe)
          .map((i) => i.id),
        categories: action.payload.categories,
        categoryIds: action.payload.categories.map((c) => c.id),
        categoryEntities: action.payload.categories.reduce(
          (e: Entities<Category>, c) => {
            return { ...e, ...{ [c.id]: c } };
          },
          {}
        ),
        categoryItemRows,
        recipes: action.payload.recipes,
        recipeIds: action.payload.recipes.map((r) => r.id),
        recipeEntities: action.payload.recipes.reduce(
          (e: Entities<Recipe>, r) => {
            return { ...e, ...{ [r.id]: r } };
          },
          {}
        ),
        recipeN: action.payload.recipes.reduce((e: Entities<number>, i, z) => {
          return { ...e, ...{ [i.id]: z } };
        }, {}),
        recipeI: action.payload.recipes.reduce((e: NEntities<string>, i, z) => {
          return { ...e, ...{ [z]: i.id } };
        }, {}),
      };
    }
    default:
      return state;
  }
}

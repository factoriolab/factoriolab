import {
  Item,
  Category,
  Recipe,
  Entities,
  Icon,
  ItemId,
  RationalItem,
  RationalRecipe,
  RecipeId,
} from '~/models';
import { DatasetAction, DatasetActionType } from './dataset.actions';

export interface DatasetState {
  categoryIds: string[];
  categoryEntities: Entities<Category>;
  categoryItemRows: Entities<string[][]>;
  iconIds: string[];
  iconEntities: Entities<Icon>;
  itemIds: string[];
  itemEntities: Entities<Item>;
  beltIds: ItemId[];
  recipeIds: string[];
  recipeEntities: Entities<Recipe>;
  limitations: Entities<RecipeId[]>;
}

export interface RationalDataset extends DatasetState {
  itemR: Entities<RationalItem>;
  recipeR: Entities<RationalRecipe>;
}

export const initialDatasetState: DatasetState = {
  categoryIds: [],
  categoryEntities: {},
  categoryItemRows: {},
  iconIds: [],
  iconEntities: {},
  itemIds: [],
  itemEntities: {},
  beltIds: [],
  recipeIds: [],
  recipeEntities: {},
  limitations: {},
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
        const rowItems = action.payload.items
          .filter((p) => p.category === category.id)
          .sort((a, b) => a.row - b.row);
        let index = rowItems[0].row;
        for (const item of rowItems) {
          if (item.row > index) {
            rows.push([]);
            index = item.row;
          }
          rows[rows.length - 1].push(item.id);
        }
        categoryItemRows[category.id] = rows;
      }

      const itemEntities = action.payload.items.reduce(
        (e: Entities<Item>, i) => ({ ...e, ...{ [i.id]: i } }),
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
        categoryIds: action.payload.categories.map((c) => c.id),
        categoryEntities: action.payload.categories.reduce(
          (e: Entities<Category>, c) => ({ ...e, ...{ [c.id]: c } }),
          {}
        ),
        categoryItemRows,
        iconIds: action.payload.icons.map((i) => i.id),
        iconEntities: action.payload.icons.reduce(
          (e: Entities<Icon>, c) => ({ ...e, ...{ [c.id]: c } }),
          {}
        ),
        itemIds: action.payload.items.map((i) => i.id),
        itemEntities,
        beltIds: action.payload.items
          .filter((i) => i.belt || i.id === ItemId.Pipe)
          .map((i) => i.id),
        recipeIds: recipes.map((r) => r.id),
        recipeEntities: recipes.reduce(
          (e: Entities<Recipe>, r) => ({ ...e, ...{ [r.id]: r } }),
          {}
        ),
        limitations: action.payload.limitations,
      };
    }
    default:
      return state;
  }
}

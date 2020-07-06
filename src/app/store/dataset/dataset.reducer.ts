import {
  Item,
  Category,
  Recipe,
  Entities,
  Icon,
  RationalItem,
  RationalRecipe,
} from '~/models';
import { DatasetAction, DatasetActionType } from './dataset.actions';

export interface DatasetState {
  categoryIds: string[];
  categoryEntities: Entities<Category>;
  categoryItemRows: Entities<string[][]>;
  iconIds: string[];
  iconEntities: Entities<Icon>;
  itemIds: string[];
  fuelIds: string[];
  factoryIds: string[];
  moduleIds: string[];
  beaconModuleIds: string[];
  itemEntities: Entities<Item>;
  itemRecipeIds: Entities<string>;
  beltIds: string[];
  recipeIds: string[];
  recipeEntities: Entities<Recipe>;
  recipeModuleIds: Entities<string[]>;
  limitations: Entities<string[]>;
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
  itemRecipeIds: {},
  beltIds: [],
  fuelIds: [],
  factoryIds: [],
  moduleIds: [],
  beaconModuleIds: [],
  recipeIds: [],
  recipeEntities: {},
  recipeModuleIds: {},
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

      const modules = action.payload.items.filter((i) => i.module);

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
        itemRecipeIds: action.payload.items.reduce((e: Entities<string>, i) => {
          const exact = action.payload.recipes.find((r) => r.id === i.id);
          if (exact) {
            return { ...e, ...{ [i.id]: i.id } };
          }
          const matches = action.payload.recipes.filter(
            (r) => r.out && r.out[i.id]
          );
          if (matches.length === 1) {
            return { ...e, ...{ [i.id]: matches[0].id } };
          }
          return e;
        }, {}),
        beltIds: action.payload.items.filter((i) => i.belt).map((i) => i.id),
        fuelIds: action.payload.items.filter((i) => i.fuel).map((i) => i.id),
        factoryIds: action.payload.items
          .filter((i) => i.factory)
          .map((i) => i.id),
        moduleIds: modules.map((i) => i.id),
        beaconModuleIds: modules
          .filter((i) => !i.module.productivity)
          .map((i) => i.id),
        recipeIds: recipes.map((r) => r.id),
        recipeEntities: recipes.reduce(
          (e: Entities<Recipe>, r) => ({ ...e, ...{ [r.id]: r } }),
          {}
        ),
        recipeModuleIds: recipes.reduce(
          (e: Entities<string[]>, r) => ({
            ...e,
            ...{
              [r.id]: modules
                .filter(
                  (m) =>
                    !m.module.limitation ||
                    action.payload.limitations[m.module.limitation].some(
                      (l) => l === r.id
                    )
                )
                .map((m) => m.id),
            },
          }),
          {}
        ),
        limitations: action.payload.limitations,
      };
    }
    default:
      return state;
  }
}

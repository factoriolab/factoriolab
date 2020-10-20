import { Entities } from '../entities';
import { Defaults } from '../defaults';
import { Category } from './category';
import { Icon } from './icon';
import { Item, RationalItem } from './item';
import { Recipe, RationalRecipe } from './recipe';

export interface Dataset {
  categoryIds: string[];
  categoryEntities: Entities<Category>;
  categoryItemRows: Entities<string[][]>;
  iconIds: string[];
  iconEntities: Entities<Icon>;
  itemIds: string[];
  beaconIds: string[];
  beltIds: string[];
  factoryIds: string[];
  fuelIds: string[];
  moduleIds: string[];
  beaconModuleIds: string[];
  itemEntities: Entities<Item>;
  itemR: Entities<RationalItem>;
  itemRecipeIds: Entities<string>;
  recipeIds: string[];
  complexRecipeIds: string[];
  recipeEntities: Entities<Recipe>;
  recipeR: Entities<RationalRecipe>;
  recipeModuleIds: Entities<string[]>;
  defaults: Defaults;
}

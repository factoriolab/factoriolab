import { Entities } from '../utils';
import { CategoryJson } from './category';
import { DefaultsJson } from './defaults';
import { IconJson } from './icon';
import { ItemJson } from './item';
import { RecipeJson } from './recipe';

export interface ModData {
  version: Entities;
  categories: CategoryJson[];
  icons: IconJson[];
  items: ItemJson[];
  recipes: RecipeJson[];
  prodUpgrades?: Entities<string[]>; // {technology recipe ID => upgraded recipe IDs}
  limitations?: Entities<string[]>;
  locations?: CategoryJson[];
  defaults?: DefaultsJson;
}

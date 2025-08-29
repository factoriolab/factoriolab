import { CategoryJson } from './category';
import { DefaultsJson } from './defaults';
import { IconJson } from './icon';
import { ItemJson } from './item';
import { RecipeJson } from './recipe';

export interface ModData {
  version: Record<string, string>;
  categories: CategoryJson[];
  icons: IconJson[];
  items: ItemJson[];
  recipes: RecipeJson[];
  limitations?: Record<string, string[]>;
  locations?: CategoryJson[];
  defaults?: DefaultsJson;
}

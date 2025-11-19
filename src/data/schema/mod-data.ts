import { Flag } from '~/state/flags';

import { CategoryJson } from './category';
import { DefaultsJson } from './defaults';
import { IconJson } from './icon-data';
import { ItemJson } from './item';
import { RecipeJson } from './recipe';

export interface ModData {
  version: Record<string, string>;
  flags: Flag[];
  categories: CategoryJson[];
  icons: IconJson[];
  items: ItemJson[];
  recipes: RecipeJson[];
  limitations?: Record<string, string[]>;
  locations?: CategoryJson[];
  defaults?: DefaultsJson;
}

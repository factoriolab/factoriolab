import { Entities } from '../utils';
import { DefaultsJson } from './defaults';
import { GroupJson } from './group';
import { IconJson } from './icon';
import { ItemJson } from './item';
import { RecipeJson } from './recipe';

export interface ModData {
  version: Entities;
  expensive?: boolean;
  groups: GroupJson[];
  icons: IconJson[];
  items: ItemJson[];
  recipes: RecipeJson[];
  limitations: Entities<string[]>;
  defaults?: DefaultsJson;
}

import { Entities } from '../entities';
import { Category } from './category';
import { Icon } from './icon';
import { Item } from './item';
import { ModDefaults } from './mod-defaults';
import { Recipe } from './recipe';

export interface ModData {
  version: Entities<string>;
  categories: Category[];
  icons: Icon[];
  items: Item[];
  recipes: Recipe[];
  limitations: Entities<string[]>;
  defaults?: ModDefaults;
}

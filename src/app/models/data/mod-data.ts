import { Category } from './category';
import { ModDefaults } from './mod-defaults';
import { Entities } from '../entities';
import { Icon } from './icon';
import { Item } from './item';
import { Recipe } from './recipe';

export interface ModData {
  categories: Category[];
  icons: Icon[];
  items: Item[];
  recipes: Recipe[];
  limitations: Entities<string[]>;
  defaults?: ModDefaults;
}

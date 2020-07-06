import { Category } from './category';
import { Defaults } from './defaults';
import { Entities } from '../entities';
import { Icon } from './icon';
import { Item } from './item';
import { Recipe } from './recipe';

export interface Dataset {
  categories: Category[];
  icons: Icon[];
  items: Item[];
  recipes: Recipe[];
  limitations: Entities<string[]>;
  defaults: Defaults;
}

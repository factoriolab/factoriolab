import { Category } from './category';
import { Icon } from './icon';
import { Item } from './item';
import { Recipe } from './recipe';

export interface Dataset {
  categories: Category[];
  icons: Icon[];
  items: Item[];
  recipes: Recipe[];
}

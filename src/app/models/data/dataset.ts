import { Entities } from '../entities';
import { Category } from './category';
import { Icon } from './icon';
import { Item } from './item';
import { Recipe, RecipeId } from './recipe';

export interface Dataset {
  categories: Category[];
  icons: Icon[];
  items: Item[];
  recipes: Recipe[];
  limitations: Entities<RecipeId[]>;
}

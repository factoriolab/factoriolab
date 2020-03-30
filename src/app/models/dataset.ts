import { Item } from './item';
import { Category } from './category';
import { Recipe } from './recipe';

export interface Dataset {
  items: Item[];
  categories: Category[];
  recipes: Recipe[];
}

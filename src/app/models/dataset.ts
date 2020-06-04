import { Category } from './category';
import { Entities, NEntities } from './entities';
import { Icon } from './icon';
import { Item, ItemId } from './item';
import { Recipe } from './recipe';

export interface Dataset {
  categories: Category[];
  icons: Icon[];
  items: Item[];
  recipes: Recipe[];
}

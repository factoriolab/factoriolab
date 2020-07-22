import { Category } from './category';
import { Defaults } from './defaults';
import { Entities } from '../entities';
import { Icon } from './icon';
import { Item } from './item';
import { Recipe } from './recipe';

export interface ModData {
  /** Do not use the colon (:) character in ID */
  id: string;
  name: string;
  sprite: string;
  categories: Category[];
  icons: Icon[];
  items: Item[];
  recipes: Recipe[];
  limitations: Entities<string[]>;
  defaults?: Defaults;
}

export const EmptyMod: ModData = {
  id: null,
  name: null,
  sprite: null,
  categories: [],
  icons: [],
  items: [],
  recipes: [],
  limitations: {},
  defaults: null,
};

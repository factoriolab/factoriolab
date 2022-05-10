import { Entities } from '../entities';

export interface ModI18n {
  categories: Entities<string>;
  items: Entities<string>;
  recipes: Entities<string>;
}

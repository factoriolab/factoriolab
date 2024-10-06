import { Category } from './data/category';

export interface CollectionItem {
  id: string;
  name: string;
  category?: Category;
}

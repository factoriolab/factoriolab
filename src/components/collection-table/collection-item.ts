import { Category } from '~/data/schema/category';

export interface CollectionItem {
  id: string;
  name: string;
  category?: Category;
}

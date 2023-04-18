import { Category } from '~/models';

export interface CollectionItem {
  id: string;
  name: string;
  category?: Category;
}

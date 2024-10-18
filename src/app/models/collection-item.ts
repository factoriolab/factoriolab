import { Group } from './data/group';

export interface CollectionItem {
  id: string;
  name: string;
  group?: Group;
}

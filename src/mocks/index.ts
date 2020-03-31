import * as data from 'src/assets/0-18.json';
import { Item } from '~/models';

let raw = data;
raw = (data as any).default;

export const Categories = raw.categories;
export const CategoryId = raw.categories[0].id;
export const ItemRows = [
  [raw.items[0].id, raw.items[1].id, raw.items[2].id],
  [raw.items[4].id, raw.items[5].id, raw.items[6].id]
];
export const ItemEntities = raw.items.reduce((e: { [id: string]: Item }, i) => {
  return { ...e, ...{ [i.id]: i } };
}, {});
export const ItemId1 = raw.items[0].id;
export const ItemId2 = raw.items[1].id;

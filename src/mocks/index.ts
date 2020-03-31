import * as data from 'src/assets/0-18.json';
import { Item, Product, RateType } from '~/models';
import Fraction from 'fraction.js';

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
export const Item1 = raw.items[0];
export const Item2 = raw.items[1];
export const Product1: Product = {
  id: 0,
  itemId: Item1.id,
  rate: new Fraction(1),
  rateType: RateType.Items
};
export const Product2: Product = {
  id: 1,
  itemId: Item2.id,
  rate: new Fraction(2),
  rateType: RateType.Belts
};
export const Products = [Product1, Product2];

import Fraction from 'fraction.js';

import { ItemId } from './item';
import { RateType } from './rate-type';

export interface Product {
  id: number;
  itemId: ItemId;
  rate: Fraction;
  rateType: RateType;
}

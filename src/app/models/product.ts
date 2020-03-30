import Fraction from 'fraction.js';

import { RateType } from './rate-type';

export interface Product {
  id: number;
  itemId: string;
  rate: Fraction;
  type: RateType;
}

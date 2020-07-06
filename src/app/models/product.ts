import { RateType } from './enum/rate-type';
import { Rational } from './rational';

export interface Product {
  id: string;
  itemId: string;
  rate: number;
  rateType: RateType;
}

export class RationalProduct {
  id: string;
  itemId: string;
  rate: Rational;
  rateType: RateType;

  constructor(data: Product) {
    this.id = data.id;
    this.itemId = data.itemId;
    this.rate = Rational.fromNumber(data.rate);
    this.rateType = data.rateType;
  }
}

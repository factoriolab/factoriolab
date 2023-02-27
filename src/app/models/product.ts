import { RateType } from './enum/rate-type';
import { Rational } from './rational';

export interface Product {
  id: string;
  itemId: string;
  rate: string;
  rateType: RateType;
}

export class RationalProduct {
  id: string;
  itemId: string;
  rate: Rational;
  rateType: RateType;

  constructor(obj: Product) {
    this.id = obj.id;
    this.itemId = obj.itemId;
    this.rate = Rational.fromString(obj.rate);
    this.rateType = obj.rateType;
  }
}

import { RateType } from './enum/rate-type';
import { Rational } from './rational';

export interface ItemObjective {
  id: string;
  itemId: string;
  rate: string;
  rateType: RateType;
}

export class RationalItemObjective {
  id: string;
  itemId: string;
  rate: Rational;
  rateType: RateType;

  constructor(obj: ItemObjective) {
    this.id = obj.id;
    this.itemId = obj.itemId;
    this.rate = Rational.fromString(obj.rate);
    this.rateType = obj.rateType;
  }
}

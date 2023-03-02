import { RateUnit } from './enum/rate-unit';
import { Rational } from './rational';

export interface ItemObjective {
  id: string;
  itemId: string;
  rate: string;
  rateUnit: RateUnit;
}

export class RationalItemObjective {
  id: string;
  itemId: string;
  rate: Rational;
  rateUnit: RateUnit;

  constructor(obj: ItemObjective) {
    this.id = obj.id;
    this.itemId = obj.itemId;
    this.rate = Rational.fromString(obj.rate);
    this.rateUnit = obj.rateUnit;
  }
}

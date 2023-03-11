import { ObjectiveType, RateUnit } from './enum';
import { Rational } from './rational';

/** Item objective configuration */
export interface ItemObj {
  id: string;
  itemId: string;
  rate: string;
  rateUnit: RateUnit;
  type: ObjectiveType;
}

/** Rational item objective configuration */
export class ItemRtlObj {
  id: string;
  itemId: string;
  rate: Rational;
  rateUnit: RateUnit;
  type: ObjectiveType;

  constructor(obj: ItemObj) {
    this.id = obj.id;
    this.itemId = obj.itemId;
    this.rate = Rational.fromString(obj.rate);
    this.rateUnit = obj.rateUnit;
    this.type = obj.type;
  }
}

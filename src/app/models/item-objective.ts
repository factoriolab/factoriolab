import { ObjectiveType, RateUnit } from './enum';
import { Rational } from './rational';

export interface ItemObjective {
  id: string;
  itemId: string;
  rate: string;
  rateUnit: RateUnit;
  type: ObjectiveType;
}

export class ItemObjectiveRational {
  id: string;
  itemId: string;
  rate: Rational;
  rateUnit: RateUnit;
  type: ObjectiveType;

  constructor(obj: ItemObjective) {
    this.id = obj.id;
    this.itemId = obj.itemId;
    this.rate = Rational.fromString(obj.rate);
    this.rateUnit = obj.rateUnit;
    this.type = obj.type;
  }
}

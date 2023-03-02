import { AmountType } from './enum/amount-type';
import { Rational } from './rational';

export interface ItemObjective {
  id: string;
  itemId: string;
  amount: string;
  amountType: AmountType;
}

export class RationalItemObjective {
  id: string;
  itemId: string;
  amount: Rational;
  amountType: AmountType;

  constructor(obj: ItemObjective) {
    this.id = obj.id;
    this.itemId = obj.itemId;
    this.amount = Rational.fromString(obj.amount);
    this.amountType = obj.amountType;
  }
}

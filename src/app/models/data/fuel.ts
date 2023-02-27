import { Rational } from '../rational';

export interface Fuel {
  category: string;
  value: number;
  result?: string;
}

export class RationalFuel {
  category: string;
  value: Rational;
  result?: string;

  constructor(obj: Fuel) {
    this.category = obj.category;
    this.value = Rational.fromNumber(obj.value);
    if (obj.result) {
      this.result = obj.result;
    }
  }
}

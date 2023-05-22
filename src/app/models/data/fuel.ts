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

  constructor(data: Fuel) {
    this.category = data.category;
    this.value = Rational.fromNumber(data.value);
    if (data.result) {
      this.result = data.result;
    }
  }
}

import { Rational } from '../rational';

export interface Fuel {
  category: string;
  value: number;
}

export class RationalFuel {
  category: string;
  value: Rational;

  constructor(data: Fuel) {
    this.category = data.category;
    this.value = Rational.fromNumber(data.value);
  }
}

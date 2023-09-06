import { Rational } from '../rational';

export interface Fuel {
  category: string;
  value: number | string;
  result?: string;
}

export class FuelRational {
  category: string;
  value: Rational;
  result?: string;

  constructor(obj: Fuel) {
    this.category = obj.category;
    this.value = Rational.from(obj.value);
    this.result = obj.result;
  }
}

import { Rational } from '../rational';

export interface Fuel {
  category: string;
  /** Fuel value in MJ */
  value: number | string;
  result?: string;
}

export class FuelRational {
  category: string;
  /** Fuel value in MJ */
  value: Rational;
  result?: string;

  constructor(obj: Fuel) {
    this.category = obj.category;
    this.value = Rational.from(obj.value);
    this.result = obj.result;
  }
}

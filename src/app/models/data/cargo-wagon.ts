import { Rational } from '../rational';

export interface CargoWagon {
  size: number;
}

export class RationalCargoWagon {
  size: Rational;

  constructor(obj: CargoWagon) {
    this.size = Rational.fromNumber(obj.size);
  }
}

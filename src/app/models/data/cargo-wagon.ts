import { Rational } from '../rational';

export interface CargoWagon {
  size: number;
}

export class RationalCargoWagon {
  size: Rational;

  constructor(data: CargoWagon) {
    this.size = Rational.fromNumber(data.size);
  }
}

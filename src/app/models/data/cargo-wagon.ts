import { Rational } from '../rational';

export interface CargoWagon {
  size: number;
}

export class CargoWagonRational {
  size: Rational;

  constructor(obj: CargoWagon) {
    this.size = Rational.from(obj.size);
  }
}

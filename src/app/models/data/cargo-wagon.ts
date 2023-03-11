import { Rational } from '../rational';

/** Cargo wagon data */
export interface CargoWagon {
  size: number;
}

/** Rational cargo wagon data */
export class CargoWagonRtl {
  size: Rational;

  constructor(obj: CargoWagon) {
    this.size = Rational.from(obj.size);
  }
}

import { Rational } from '../rational';

export interface FluidWagon {
  capacity: number | string;
}

export class FluidWagonRational {
  capacity: Rational;

  constructor(obj: FluidWagon) {
    this.capacity = Rational.from(obj.capacity);
  }
}

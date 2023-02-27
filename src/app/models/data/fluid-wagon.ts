import { Rational } from '../rational';

export interface FluidWagon {
  capacity: number;
}

export class RationalFluidWagon {
  capacity: Rational;

  constructor(obj: FluidWagon) {
    this.capacity = Rational.fromNumber(obj.capacity);
  }
}

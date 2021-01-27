import { Rational } from '../rational';

export interface FluidWagon {
  capacity: number;
}

export class RationalFluidWagon {
  capacity: Rational;

  constructor(data: FluidWagon) {
    this.capacity = Rational.fromNumber(data.capacity);
  }
}

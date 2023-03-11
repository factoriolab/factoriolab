import { Rational } from '../rational';

/** Fluid wagon data */
export interface FluidWagon {
  capacity: number | string;
}

/** Rational fluid wagon data */
export class FluidWagonRtl {
  capacity: Rational;

  constructor(obj: FluidWagon) {
    this.capacity = Rational.from(obj.capacity);
  }
}

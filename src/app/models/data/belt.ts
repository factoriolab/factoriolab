import { Rational } from '../rational';

/** Belt data */
export interface Belt {
  speed: number | string;
}

/** Rational belt data */
export class BeltRtl {
  speed: Rational;

  constructor(obj: Belt) {
    this.speed = Rational.from(obj.speed);
  }
}

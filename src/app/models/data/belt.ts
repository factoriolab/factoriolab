import { Rational } from '../rational';

export interface Belt {
  speed: number | string;
}

export class RationalBelt {
  speed: Rational;

  constructor(obj: Belt) {
    this.speed = Rational.from(obj.speed);
  }
}

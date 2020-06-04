import { Rational } from '../rational';

export interface Belt {
  speed: number;
}

export class RationalBelt {
  speed: Rational;

  constructor(data: Belt) {
    this.speed = Rational.fromNumber(data.speed);
  }
}

import { Rational } from '../rational';

export interface Belt {
  speed: number | string;
}

export class RationalBelt {
  speed: Rational;

  constructor(data: Belt) {
    this.speed = Rational.fromJson(data.speed);
  }
}

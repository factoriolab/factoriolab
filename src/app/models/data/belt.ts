import { Rational } from '../rational';

export interface Belt {
  speed: number | string;
}

export class BeltRational {
  speed: Rational;

  constructor(obj: Belt) {
    this.speed = Rational.from(obj.speed);
  }
}

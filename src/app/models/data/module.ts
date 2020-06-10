import { Rational } from '../math/rational';

export interface Module {
  speed?: number;
  productivity?: number;
  consumption?: number;
  pollution?: number;
  limitation?: string;
}

export class RationalModule {
  speed?: Rational;
  productivity?: Rational;
  consumption?: Rational;
  pollution?: Rational;
  limitation?: string;

  constructor(data: Module) {
    if (data.speed) {
      this.speed = Rational.fromNumber(data.speed);
    }
    if (data.productivity) {
      this.productivity = Rational.fromNumber(data.productivity);
    }
    if (data.consumption) {
      this.consumption = Rational.fromNumber(data.consumption);
    }
    if (data.pollution) {
      this.pollution = Rational.fromNumber(data.pollution);
    }
    if (data.limitation) {
      this.limitation = data.limitation;
    }
  }
}

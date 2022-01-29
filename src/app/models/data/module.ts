import { Rational } from '../rational';

export interface Module {
  speed?: number;
  productivity?: number;
  consumption?: number;
  pollution?: number;
  limitation?: string;
  sprays?: number;
  proliferator?: string;
}

export class RationalModule {
  speed?: Rational;
  productivity?: Rational;
  consumption?: Rational;
  pollution?: Rational;
  limitation?: string;
  sprays?: Rational;
  proliferator?: string;

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
    if (data.sprays) {
      this.sprays = Rational.fromNumber(data.sprays);
    }
    if (data.proliferator) {
      this.proliferator = data.proliferator;
    }
  }
}

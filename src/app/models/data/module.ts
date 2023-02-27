import { Rational } from '../rational';

export type ModuleEffect =
  | 'speed'
  | 'productivity'
  | 'consumption'
  | 'pollution';

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

  constructor(obj: Module) {
    if (obj.speed) {
      this.speed = Rational.fromNumber(obj.speed);
    }
    if (obj.productivity) {
      this.productivity = Rational.fromNumber(obj.productivity);
    }
    if (obj.consumption) {
      this.consumption = Rational.fromNumber(obj.consumption);
    }
    if (obj.pollution) {
      this.pollution = Rational.fromNumber(obj.pollution);
    }
    if (obj.limitation) {
      this.limitation = obj.limitation;
    }
    if (obj.sprays) {
      this.sprays = Rational.fromNumber(obj.sprays);
    }
    if (obj.proliferator) {
      this.proliferator = obj.proliferator;
    }
  }
}

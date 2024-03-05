import { Rational } from '../rational';

export type ModuleEffect =
  | 'speed'
  | 'productivity'
  | 'consumption'
  | 'pollution';

export interface Module {
  consumption?: number | string;
  pollution?: number | string;
  productivity?: number | string;
  speed?: number | string;
  limitation?: string;
  sprays?: number;
  proliferator?: string;
}

export class ModuleRational {
  speed?: Rational;
  productivity?: Rational;
  consumption?: Rational;
  pollution?: Rational;
  limitation?: string;
  sprays?: Rational;
  proliferator?: string;

  constructor(obj: Module) {
    if (obj.speed) {
      this.speed = Rational.from(obj.speed);
    }

    if (obj.productivity) {
      this.productivity = Rational.from(obj.productivity);
    }

    if (obj.consumption) {
      this.consumption = Rational.from(obj.consumption);
    }

    if (obj.pollution) {
      this.pollution = Rational.from(obj.pollution);
    }

    this.limitation = obj.limitation;

    if (obj.sprays) {
      this.sprays = Rational.fromNumber(obj.sprays);
    }

    this.proliferator = obj.proliferator;
  }
}

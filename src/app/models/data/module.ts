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
    this.speed = Rational.from(obj.speed);
    this.productivity = Rational.from(obj.productivity);
    this.consumption = Rational.from(obj.consumption);
    this.pollution = Rational.from(obj.pollution);
    this.limitation = obj.limitation;
    this.sprays = Rational.from(obj.sprays);
    this.proliferator = obj.proliferator;
  }
}

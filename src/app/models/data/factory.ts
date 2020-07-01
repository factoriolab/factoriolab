import { Rational } from '../rational';

export interface Factory {
  speed: number;
  modules: number;
  /** Fuel consumption in kW */
  burner?: number;
  electric?: number;
  drain?: number;
  mining?: boolean;
  research?: boolean;
}

export class RationalFactory {
  speed: Rational;
  modules: number;
  /** Fuel consumption in kW */
  burner?: Rational;
  electric?: Rational;
  drain?: Rational;
  mining?: boolean;
  research?: boolean;

  constructor(data: Factory) {
    this.speed = Rational.fromNumber(data.speed);
    this.modules = Math.round(data.modules);
    if (data.burner) {
      this.burner = Rational.fromNumber(data.burner);
    }
    if (data.electric) {
      this.electric = Rational.fromNumber(data.electric);
    }
    if (data.drain) {
      this.drain = Rational.fromNumber(data.drain);
    }
    if (data.mining) {
      this.mining = data.mining;
    }
    if (data.research) {
      this.research = data.research;
    }
  }
}

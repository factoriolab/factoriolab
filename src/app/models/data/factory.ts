import { Rational } from '../rational';

export interface Factory {
  speed: number;
  modules: number;
  /** Fuel consumption in kW */
  burner?: number;
  electric?: number;
  drain?: number;
}

export class RationalFactory {
  speed: Rational;
  modules: number;
  /** Fuel consumption in kW */
  burner?: Rational;
  electric?: Rational;
  drain?: Rational;

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
  }
}

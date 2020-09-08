import { Rational } from '../rational';

export interface Beacon {
  effectivity: number;
  modules: number;
  range: number;
  burner?: number;
  electric?: number;
}

export class RationalBeacon {
  effectivity: Rational;
  modules: number;
  range: number;
  burner?: number;
  electric?: number;

  constructor(data: Beacon) {
    this.effectivity = Rational.fromNumber(data.effectivity);
    this.modules = data.modules;
    this.range = data.range;
    if (data.burner) {
      this.burner = data.burner;
    }
    if (data.electric) {
      this.electric = data.electric;
    }
  }
}

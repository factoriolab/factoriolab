import { Rational } from '../rational';

export interface Beacon {
  effectivity: number;
  modules: number;
  range: number;
  /** Energy type, e.g. electric or burner */
  type?: string;
  /** Fuel category, e.g. chemical or nuclear */
  category?: string;
  /** Energy consumption in kW */
  usage?: number;
}

export class RationalBeacon {
  effectivity: Rational;
  modules: number;
  range: number;
  /** Energy type, e.g. electric or burner */
  type?: string;
  /** Fuel category, e.g. chemical or nuclear */
  category?: string;
  /** Energy consumption in kW */
  usage?: Rational;

  constructor(data: Beacon) {
    this.effectivity = Rational.fromNumber(data.effectivity);
    this.modules = data.modules;
    this.range = data.range;
    if (data.type) {
      this.type = data.type;
    }
    if (data.category) {
      this.category = data.category;
    }
    if (data.usage != null) {
      this.usage = Rational.fromNumber(data.usage);
    }
  }
}

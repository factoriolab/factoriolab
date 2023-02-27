import { Rational } from '../rational';
import { ModuleEffect } from './module';

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
  disallowEffects?: ModuleEffect[];
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
  disallowEffects?: ModuleEffect[];

  constructor(obj: Beacon) {
    this.effectivity = Rational.fromNumber(obj.effectivity);
    this.modules = obj.modules;
    this.range = obj.range;
    if (obj.type) {
      this.type = obj.type;
    }
    if (obj.category) {
      this.category = obj.category;
    }
    if (obj.usage != null) {
      this.usage = Rational.fromNumber(obj.usage);
    }
    if (obj.disallowEffects) {
      this.disallowEffects = obj.disallowEffects;
    }
  }
}

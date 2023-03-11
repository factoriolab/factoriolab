import { Rational } from '../rational';
import { ModuleEffect } from './module';

/** Beacon data */
export interface Beacon {
  effectivity: number | string;
  modules: number;
  range: number;
  /** Energy type, e.g. electric or burner */
  type?: string;
  /** Fuel category, e.g. chemical or nuclear */
  category?: string;
  /** Energy consumption in kW */
  usage?: number | string;
  disallowEffects?: ModuleEffect[];
}

/** Rational beacon data */
export class BeaconRtl {
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
    this.effectivity = Rational.from(obj.effectivity);
    this.modules = obj.modules;
    this.range = obj.range;
    if (obj.type) {
      this.type = obj.type;
    }
    if (obj.category) {
      this.category = obj.category;
    }
    if (obj.usage != null) {
      this.usage = Rational.from(obj.usage);
    }
    if (obj.disallowEffects) {
      this.disallowEffects = obj.disallowEffects;
    }
  }
}

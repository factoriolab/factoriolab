import { Entities } from '../entities';
import { Rational } from '../rational';
import { ModuleEffect } from './module';
import { RationalSilo, Silo } from './silo';

export interface Machine {
  speed?: number | string;
  modules?: number;
  /** Energy type, e.g. electric or burner */
  type?: string;
  /** Fuel category, e.g. chemical or nuclear */
  category?: string;
  /** Energy consumption in kW */
  usage?: number | string;
  /** Drain in kW */
  drain?: number | string;
  /** Pollution in #/m */
  pollution?: number | string;
  mining?: boolean;
  research?: boolean;
  silo?: Silo;
  consumption?: Entities<number | string>;
  disallowEffects?: ModuleEffect[];
}

export class RationalMachine {
  speed?: Rational;
  modules?: number;
  /** Energy type, e.g. electric or burner */
  type?: string;
  /** Fuel category, e.g. chemical or nuclear */
  category?: string;
  /** Energy consumption in kW */
  usage?: Rational;
  drain?: Rational;
  pollution?: Rational;
  mining?: boolean;
  research?: boolean;
  silo?: RationalSilo;
  consumption?: Entities<Rational>;
  disallowEffects?: ModuleEffect[];

  constructor(obj: Machine) {
    if (obj.speed != null) {
      this.speed = Rational.from(obj.speed);
    }
    if (obj.modules != null) {
      this.modules = Math.round(obj.modules);
    }
    if (obj.type) {
      this.type = obj.type;
    }
    if (obj.category) {
      this.category = obj.category;
    }
    if (obj.usage != null) {
      this.usage = Rational.from(obj.usage);
    }
    if (obj.drain != null) {
      this.drain = Rational.from(obj.drain);
    }
    if (obj.pollution != null) {
      this.pollution = Rational.from(obj.pollution);
    }
    if (obj.mining) {
      this.mining = obj.mining;
    }
    if (obj.research) {
      this.research = obj.research;
    }
    if (obj.silo) {
      this.silo = new RationalSilo(obj.silo);
    }
    if (obj.consumption) {
      const consumption = obj.consumption;
      this.consumption = Object.keys(consumption).reduce(
        (e: Entities<Rational>, i) => {
          e[i] = Rational.from(consumption[i]);
          return e;
        },
        {}
      );
    }
    if (obj.disallowEffects) {
      this.disallowEffects = obj.disallowEffects;
    }
  }
}

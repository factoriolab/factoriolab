import { Entities } from '../entities';
import { EnergyType } from '../enum';
import { Rational } from '../rational';
import { ModuleEffect } from './module';
import { Silo, SiloRational } from './silo';

export interface Machine {
  speed?: number | string;
  modules?: number;
  disallowedEffects?: ModuleEffect[];
  type?: EnergyType;
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
}

export class MachineRational {
  speed: Rational;
  modules?: number;
  disallowedEffects?: ModuleEffect[];
  type?: EnergyType;
  /** Fuel category, e.g. chemical or nuclear */
  category?: string;
  /** Energy consumption in kW */
  usage?: Rational;
  drain?: Rational;
  pollution?: Rational;
  mining?: boolean;
  research?: boolean;
  silo?: SiloRational;
  consumption?: Entities<Rational>;

  constructor(obj: Machine) {
    this.speed = Rational.from(obj.speed ?? 1);

    if (obj.modules != null) {
      this.modules = Math.round(obj.modules);
    }
    if (obj.disallowedEffects) {
      this.disallowedEffects = obj.disallowedEffects;
    }
    if (obj.type != null) {
      this.type = obj.type;
    }
    if (obj.usage != null) {
      this.usage = Rational.from(obj.usage);
    }
    if (obj.category) {
      this.category = obj.category;
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
      this.silo = new SiloRational(obj.silo);
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
  }
}

import { Entities } from '../entities';
import { EnergyType } from '../enum';
import { Rational } from '../rational';
import { ModuleEffect } from './module';
import { Silo, SiloRational } from './silo';

export interface Machine {
  /** Energy type, e.g. electric or burner */
  type: EnergyType;
  speed: number | string;
  /** Energy consumption in kW */
  usage: number | string;
  modules?: number;
  /** Fuel category, e.g. chemical or nuclear */
  category?: string;
  /** Drain in kW */
  drain?: number | string;
  /** Pollution in #/m */
  pollution?: number | string;
  mining?: boolean;
  research?: boolean;
  silo?: Silo;
  consumption?: Entities<number | string>;
  disallowedEffects?: ModuleEffect[];
}

export class MachineRational {
  /** Energy type, e.g. electric or burner */
  type: EnergyType;
  speed: Rational;
  /** Energy consumption in kW */
  usage: Rational;
  modules?: number;
  /** Fuel category, e.g. chemical or nuclear */
  category?: string;
  drain?: Rational;
  pollution?: Rational;
  mining?: boolean;
  research?: boolean;
  silo?: SiloRational;
  consumption?: Entities<Rational>;
  disallowedEffects?: ModuleEffect[];

  constructor(obj: Machine) {
    this.type = obj.type;
    this.speed = Rational.from(obj.speed);
    this.usage = Rational.from(obj.usage);

    if (obj.modules != null) {
      this.modules = Math.round(obj.modules);
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
    if (obj.disallowedEffects) {
      this.disallowedEffects = obj.disallowedEffects;
    }
  }
}

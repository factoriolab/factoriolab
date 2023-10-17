import { EnergyType } from '../enum';
import { Rational } from '../rational';
import { ModuleEffect } from './module';

export interface Beacon {
  effectivity: number | string;
  modules: number;
  range: number;
  /** Beacons must use electric energy source, if any */
  type?: EnergyType.Electric;
  /** Energy consumption in kW */
  usage?: number;
  disallowedEffects?: ModuleEffect[];
  /** Width and height in tiles (integers, unless off-grid entity like tree) */
  size?: [number, number];
}

export class BeaconRational {
  effectivity: Rational;
  modules: number;
  range: number;
  /** Beacons must use electric or void energy source */
  type?: EnergyType.Electric;
  /** Energy consumption in kW */
  usage?: Rational;
  disallowedEffects?: ModuleEffect[];
  /** Width and height in tiles (integers, unless off-grid entity like tree) */
  size?: [number, number];

  constructor(obj: Beacon) {
    this.effectivity = Rational.from(obj.effectivity);
    this.modules = obj.modules;
    this.range = obj.range;
    this.type = obj.type;
    this.disallowedEffects = obj.disallowedEffects;
    this.size = obj.size;

    if (obj.usage) {
      this.usage = Rational.fromNumber(obj.usage);
    }
  }
}

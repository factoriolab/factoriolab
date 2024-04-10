import { EnergyType } from '../enum';
import { Rational, rational } from '../rational';
import { ModuleEffect } from './module';

export interface BeaconJson {
  effectivity: number | string;
  modules: number | string;
  range?: number | string;
  /** Beacons must use electric energy source, if any */
  type?: EnergyType.Electric;
  /** Energy consumption in kW */
  usage?: number | string;
  disallowedEffects?: ModuleEffect[];
  /** Width and height in tiles (integers, unless off-grid entity like tree) */
  size?: [number, number];
}

export interface Beacon {
  effectivity: Rational;
  modules: Rational;
  range?: Rational;
  /** Beacons must use electric or void energy source */
  type?: EnergyType.Electric;
  /** Energy consumption in kW */
  usage?: Rational;
  disallowedEffects?: ModuleEffect[];
  /** Width and height in tiles (integers, unless off-grid entity like tree) */
  size?: [number, number];
}

export function parseBeacon(json: BeaconJson): Beacon;
export function parseBeacon(json: BeaconJson | undefined): Beacon | undefined;
export function parseBeacon(json: BeaconJson | undefined): Beacon | undefined {
  if (json == null) return;
  return {
    effectivity: rational(json.effectivity),
    modules: rational(json.modules),
    range: rational(json.range),
    type: json.type,
    usage: rational(json.usage),
    disallowedEffects: json.disallowedEffects,
    size: json.size,
  };
}

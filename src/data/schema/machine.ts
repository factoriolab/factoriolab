import { Rational, rational } from '~/rational/rational';
import { asSet } from '~/utils/coercion';
import { toRationalRecord } from '~/utils/record';

import { ModuleEffect } from './module';
import { parseSilo, Silo, SiloJson } from './silo';

export type MachineFlag =
  /** Whether to hide the calculated number of machines */
  | 'hideRate'
  /** Whether to tally totals by recipe instead of by machine */
  | 'totalRecipe';

export interface MachineJson {
  /** If undefined, speed is based on belt speed */
  speed?: number | string;
  modules?: number | true;
  disallowedEffects?: ModuleEffect[];
  /** Electric energy consumption in kW */
  usage?: number | string;
  /** Electric drain in kW */
  drain?: number | string;
  /** Burner energy consumption in kW */
  burner?: number | string;
  /** Heat energy consumption in kW */
  heat?: number | string;
  /** Pollution in #/m */
  pollution?: number | string;
  /** Fuel categories, e.g. chemical or nuclear */
  fuelTypes?: string[];
  /** Indicates a specific fuel that must be used */
  fuel?: string;
  neighborBonus?: number | string;
  silo?: SiloJson;
  consumption?: Partial<Record<string, number | string>>;
  /** Width and height in tiles (integers, unless off-grid entity like tree) */
  size?: [number, number];
  /** Bonus effects that this machine always has */
  baseEffect?: Partial<Record<ModuleEffect, number>>;
  locations?: string[];
  /** Percent of ingredients used (Space Age: Biolab) */
  ingredientUsage?: number;
  flags?: MachineFlag[];
  qualityRecord?: Record<string, Partial<MachineJson>>;
}

export interface Machine {
  /** If undefined, speed is based on belt speed */
  speed?: Rational;
  modules?: Rational | true;
  disallowedEffects?: ModuleEffect[];
  /** Electric energy consumption in kW */
  usage?: Rational;
  /** Electric drain in kW */
  drain?: Rational;
  /** Burner energy consumption in kW */
  burner?: Rational;
  /** Heat energy consumption in kW */
  heat?: Rational;
  /** Pollution in #/m */
  pollution?: Rational;
  /** Fuel categories, e.g. chemical or nuclear */
  fuelTypes?: Set<string>;
  /** Indicates a specific fuel that must be used */
  fuel?: string;
  neighborBonus?: Rational;
  silo?: Silo;
  consumption?: Partial<Record<string, Rational>>;
  /** Width and height in tiles (integers, unless off-grid entity like tree) */
  size?: [number, number];
  /** Bonus effects that this machine always has */
  baseEffect?: Partial<Record<ModuleEffect, Rational>>;
  locations?: string[];
  /** Percent of ingredients used (Space Age: Biolab) */
  ingredientUsage?: Rational;
  flags: Set<MachineFlag>;
}

export function parseMachine(json: MachineJson): Machine;
export function parseMachine(
  json: MachineJson | undefined,
): Machine | undefined;
export function parseMachine(
  json: MachineJson | undefined,
): Machine | undefined {
  if (json == null) return;
  return {
    speed: rational(json.speed),
    modules:
      json.modules === true
        ? json.modules
        : json.modules === 0
          ? undefined
          : rational(json.modules),
    disallowedEffects: json.disallowedEffects,
    usage: rational(json.usage),
    drain: rational(json.drain),
    burner: rational(json.burner),
    heat: rational(json.heat),
    pollution: rational(json.pollution),
    fuelTypes: asSet(json.fuelTypes),
    fuel: json.fuel,
    neighborBonus: rational(json.neighborBonus),
    silo: parseSilo(json.silo),
    consumption: toRationalRecord(json.consumption),
    size: json.size,
    baseEffect: json.baseEffect ? parseBaseEffect(json.baseEffect) : undefined,
    locations: json.locations,
    ingredientUsage: rational(json.ingredientUsage),
    flags: new Set(json.flags),
  };
}

function parseBaseEffect(
  eff: Partial<Record<ModuleEffect, number>>,
): Partial<Record<ModuleEffect, Rational>> {
  const keys = Object.keys(eff) as ModuleEffect[];
  return keys.reduce((e: Partial<Record<ModuleEffect, Rational>>, k) => {
    e[k] = rational(eff[k]);
    return e;
  }, {});
}

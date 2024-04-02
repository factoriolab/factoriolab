import { Rational } from '../rational';

export type ModuleEffect =
  | 'consumption'
  | 'pollution'
  | 'productivity'
  | 'speed';

export interface ModuleJson {
  consumption?: number | string;
  pollution?: number | string;
  productivity?: number | string;
  speed?: number | string;
  limitation?: string;
  sprays?: number;
  proliferator?: string;
}

export interface Module {
  consumption?: Rational;
  pollution?: Rational;
  productivity?: Rational;
  speed?: Rational;
  limitation?: string;
  sprays?: Rational;
  proliferator?: string;
}

export function parseModule(json: ModuleJson): Module;
export function parseModule(json: ModuleJson | undefined): Module | undefined;
export function parseModule(json: ModuleJson | undefined): Module | undefined {
  if (json == null) return;
  return {
    consumption: Rational.from(json.consumption),
    pollution: Rational.from(json.pollution),
    productivity: Rational.from(json.productivity),
    speed: Rational.from(json.speed),
    limitation: json.limitation,
    sprays: Rational.from(json.sprays),
    proliferator: json.proliferator,
  };
}

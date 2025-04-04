import { Rational, rational } from '../rational';

export type ModuleEffect =
  | 'consumption'
  | 'pollution'
  | 'productivity'
  | 'quality'
  | 'speed';

export const effectPrecision: Record<ModuleEffect, number> = {
  consumption: 2,
  pollution: 2,
  productivity: 2,
  quality: 3,
  speed: 2,
};

export const goodNegativeEffects = new Set<ModuleEffect>([
  'consumption',
  'pollution',
]);

export function filterEffect(module: Module, effect: ModuleEffect): boolean {
  return (
    module[effect] == null ||
    (goodNegativeEffects.has(effect)
      ? module[effect].gte(rational.zero)
      : module[effect].lte(rational.zero))
  );
}

export interface ModuleJson {
  consumption?: number | string;
  pollution?: number | string;
  productivity?: number | string;
  quality?: number | string;
  speed?: number | string;
  limitation?: string;
  sprays?: number;
  proliferator?: string;
}

export interface Module {
  consumption?: Rational;
  pollution?: Rational;
  productivity?: Rational;
  quality?: Rational;
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
    consumption: rational(json.consumption),
    pollution: rational(json.pollution),
    productivity: rational(json.productivity),
    quality: rational(json.quality),
    speed: rational(json.speed),
    limitation: json.limitation,
    sprays: rational(json.sprays),
    proliferator: json.proliferator,
  };
}

import fs from 'fs';
import {
  EffectTypeLimitation,
  FluidPrototype,
  IngredientPrototype,
  PrototypeBase,
  ResearchIngredient,
  SurfaceCondition,
} from 'scripts/factorio.models';

import {
  allEffects,
  anyEntityKeys,
  AnyEntityPrototype,
  anyItemKeys,
  AnyItemPrototype,
  anyLocationKeys,
  AnyLocationPrototype,
  DataRawDump,
  EffectType,
  isFluidIngredient,
  ModList,
  PlayerData,
} from '../factorio-build.models';
import { getJsonData } from './file';

export function addEntityValue(
  e: Record<string, number>,
  id: string,
  val: number,
): void {
  if (e[id] == null) e[id] = val;
  else e[id] += val;
}

export function pushEntityValue(
  e: Record<string, string[]>,
  id: string,
  val: string,
): void {
  if (e[id] == null) e[id] = [val];
  else e[id].push(val);
}

export function coerceArray<T>(
  value: T[] | Record<string, T> | null | undefined,
): T[] {
  if (value == null) return [];
  if (Array.isArray(value)) return value;

  const record = value;
  return Object.keys(record).map((k) => record[k]);
}

export function coerceString(
  value: string | number | null | undefined,
): string {
  if (value == null) return '';
  return value.toString();
}

export function getEntityMap(
  dataRaw: DataRawDump,
): Record<string, AnyEntityPrototype> {
  return anyEntityKeys.reduce(
    (result: Record<string, AnyEntityPrototype>, key) => {
      if (dataRaw[key] == null) return result;
      const raw = dataRaw[key];
      return Object.keys(raw).reduce((result, name) => {
        result[name] = raw[name];
        return result;
      }, result);
    },
    {},
  );
}

export function getItemMap(
  dataRaw: DataRawDump,
): Record<string, AnyItemPrototype | FluidPrototype> {
  return anyItemKeys.reduce(
    (result: Record<string, AnyItemPrototype | FluidPrototype>, key) => {
      const data = dataRaw[key] ?? {};
      return Object.keys(data).reduce((r, name) => {
        r[name] = data[name];
        return r;
      }, result);
    },
    {},
  );
}

export function getSurfacePropertyDefaults(
  dataRaw: DataRawDump,
): Record<string, number> {
  return Object.keys(dataRaw['surface-property']).reduce(
    (result: Record<string, number>, key) => {
      result[key] = dataRaw['surface-property'][key].default_value;
      return result;
    },
    {},
  );
}

export function getLocations(dataRaw: DataRawDump): AnyLocationPrototype[] {
  return anyLocationKeys.reduce((result: AnyLocationPrototype[], key) => {
    const data = dataRaw[key] ?? {};
    result.push(...Object.keys(data).map((k) => data[k]));
    return result;
  }, []);
}

export function getAllowedLocations(
  surface_conditions: SurfaceCondition[] | undefined,
  locations: AnyLocationPrototype[],
  defaults: Record<string, number>,
): AnyLocationPrototype[] | undefined {
  if (surface_conditions == null) return undefined;

  const matches = locations.filter((l) => {
    return surface_conditions.every((c) => {
      const value = l.surface_properties?.[c.property] ?? defaults[c.property];
      if (c.max != null && value > c.max) return false;
      if (c.min != null && value < c.min) return false;
      return true;
    });
  });

  if (matches.length === locations.length) return undefined;

  return matches;
}

export function getDisallowedEffects(
  allowedEffects?: EffectTypeLimitation,
  defaultDisallow = false,
): EffectType[] | undefined {
  if (allowedEffects == null) return defaultDisallow ? allEffects : undefined;

  allowedEffects =
    typeof allowedEffects === 'string'
      ? [allowedEffects]
      : coerceArray(allowedEffects);

  const checked = allowedEffects;
  const result = allEffects.filter((e) => !checked.includes(e));
  return result.length === 0 ? undefined : result;
}

export function getIconText(proto: PrototypeBase): string | undefined {
  const match = /-(\d+)$/.exec(proto.name);
  return match?.[1] ? match[1] : undefined;
}

export function getIngredients(
  ingredients: IngredientPrototype[] | undefined,
): [
  // Ingredients
  Record<string, number>,
  // Min / max fluid temperatures, if defined
  Record<string, [number | undefined, number | undefined]>,
] {
  const result: Record<string, number> = {};
  const temps: Record<string, [number | undefined, number | undefined]> = {};

  for (const ingredient of coerceArray(ingredients)) {
    if (isFluidIngredient(ingredient)) {
      if (ingredient.temperature) {
        temps[ingredient.name] = [
          ingredient.temperature,
          ingredient.temperature,
        ];
      } else {
        temps[ingredient.name] = [
          ingredient.minimum_temperature,
          ingredient.maximum_temperature,
        ];
      }
    }
    addEntityValue(result, ingredient.name, ingredient.amount);
  }

  return [result, temps];
}

export function getLastIngredient(ingredients: ResearchIngredient[]): string {
  if (ingredients.length === 0) return '';

  const ingredient = ingredients[ingredients.length - 1];
  return ingredient[0];
}

const builtIn = new Set(['base', 'elevated-rails', 'quality', 'space-age']);
export function getVersion(
  modsPath: string,
  factorioPath: string,
): Record<string, string> {
  const modListPath = `${modsPath}/mod-list.json`;
  const modList = getJsonData(modListPath) as ModList;
  const playerDataPath = `${factorioPath}/player-data.json`;
  const playerData = getJsonData(playerDataPath) as PlayerData;

  const modFiles = fs
    .readdirSync(modsPath)
    // Only include zip files
    .filter((f) => f.endsWith('.zip'))
    // Trim .zip from end of string
    .map((f) => f.substring(0, f.length - 4));

  return modList.mods
    .filter((m) => m.enabled)
    .reduce((version: Record<string, string>, mod) => {
      if (builtIn.has(mod.name)) {
        version[mod.name] = playerData['last-played-version'].game_version;
        return version;
      }

      const file = modFiles.find((f) => f.startsWith(mod.name + '_'));
      if (file == null)
        throw new Error(`No mod file found for mod ${mod.name}`);

      version[mod.name] = file.substring(mod.name.length + 1);
      return version;
    }, {});
}

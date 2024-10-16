import fs from 'fs';
import {
  EffectTypeLimitation,
  FluidPrototype,
  IngredientPrototype,
  PrototypeBase,
} from 'scripts/factorio.models';

import { ModHash } from '~/models/data/mod-hash';
import { Entities } from '~/models/utils';

import {
  allEffects,
  anyEntityKeys,
  AnyEntityPrototype,
  anyItemKeys,
  AnyItemPrototype,
  DataRawDump,
  EffectType,
  isFluidIngredient,
  isSimpleIngredient,
  ModList,
  PlayerData,
} from '../factorio-build.models';
import { getJsonData } from './file.helpers';

export function addEntityValue(
  e: Entities<number>,
  id: string,
  val: number,
): void {
  if (e[id] == null) e[id] = val;
  else e[id] = e[id] + val;
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
    (result: Record<string, AnyEntityPrototype>, key) =>
      Object.keys(dataRaw[key]).reduce((result, name) => {
        result[name] = dataRaw[key][name];
        return result;
      }, result),
    {},
  );
}

export function getItemMap(
  dataRaw: DataRawDump,
): Record<string, AnyItemPrototype | FluidPrototype> {
  return anyItemKeys.reduce(
    (result: Record<string, AnyItemPrototype | FluidPrototype>, key) =>
      Object.keys(dataRaw[key]).reduce((result, name) => {
        result[name] = dataRaw[key][name];
        return result;
      }, result),
    {},
  );
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
  ingredients: IngredientPrototype[] | Record<string, IngredientPrototype>,
): [
  // Ingredients
  Record<string, number>,
  // Min / max fluid temperatures, if defined
  Record<string, [number | undefined, number | undefined]>,
] {
  const result: Record<string, number> = {};
  const temps: Record<string, [number | undefined, number | undefined]> = {};

  for (const ingredient of coerceArray(ingredients)) {
    if (isSimpleIngredient(ingredient)) {
      const [itemId, amount] = ingredient;
      addEntityValue(result, itemId, amount);
    } else {
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
  }

  return [result, temps];
}

export function getLastIngredient(ingredients: IngredientPrototype[]): string {
  if (ingredients.length === 0) return '';

  const ingredient = ingredients[ingredients.length - 1];
  if (isSimpleIngredient(ingredient)) return ingredient[0];
  else return ingredient.name;
}

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
      if (mod.name === 'base') {
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

export function emptyModHash(): ModHash {
  return {
    items: [],
    beacons: [],
    belts: [],
    fuels: [],
    wagons: [],
    machines: [],
    modules: [],
    technologies: [],
    recipes: [],
  };
}

import fs from 'fs';

import { Entities, ModHash } from '~/models';
import * as D from '../factorio-build.models';
import * as M from '../factorio.models';
import { getJsonData } from './file.helpers';

export function addEntityValue(
  e: Entities<number>,
  id: string,
  val: number,
): void {
  if (e[id] == null) {
    e[id] = val;
  } else {
    e[id] = e[id] + val;
  }
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
  dataRaw: D.DataRawDump,
): Record<string, D.AnyEntityPrototype> {
  return D.anyEntityKeys.reduce(
    (result: Record<string, D.AnyEntityPrototype>, key) =>
      Object.keys(dataRaw[key]).reduce((result, name) => {
        result[name] = dataRaw[key][name];
        return result;
      }, result),
    {},
  );
}

export function getItemMap(
  dataRaw: D.DataRawDump,
): Record<string, D.AnyItemPrototype | M.FluidPrototype> {
  return D.anyItemKeys.reduce(
    (result: Record<string, D.AnyItemPrototype | M.FluidPrototype>, key) =>
      Object.keys(dataRaw[key]).reduce((result, name) => {
        result[name] = dataRaw[key][name];
        return result;
      }, result),
    {},
  );
}

export function getDisallowedEffects(
  allowedEffects?: M.EffectTypeLimitation,
  defaultDisallow = false,
): D.EffectType[] | undefined {
  if (allowedEffects == null) {
    return defaultDisallow ? D.allEffects : undefined;
  }

  allowedEffects =
    typeof allowedEffects === 'string'
      ? [allowedEffects]
      : coerceArray(allowedEffects);

  const checked = allowedEffects;
  const result = D.allEffects.filter((e) => checked.indexOf(e) === -1);
  return result.length === 0 ? undefined : result;
}

export function getIconText(proto: M.PrototypeBase): string | undefined {
  const match = /-(\d+)$/.exec(proto.name);
  return match?.[1] ? match[1] : undefined;
}

export function getIngredients(
  ingredients: M.IngredientPrototype[] | Record<string, M.IngredientPrototype>,
): [
  // Ingredients
  Record<string, number>,
  // Min / max fluid temperatures, if defined
  Record<string, [number | undefined, number | undefined]>,
] {
  const result: Record<string, number> = {};
  const temps: Record<string, [number | undefined, number | undefined]> = {};

  for (const ingredient of coerceArray(ingredients)) {
    if (D.isSimpleIngredient(ingredient)) {
      const [itemId, amount] = ingredient;
      addEntityValue(result, itemId, amount);
    } else {
      if (D.isFluidIngredient(ingredient)) {
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

export function getLastIngredient(
  ingredients: M.IngredientPrototype[],
): string {
  if (ingredients.length === 0) return '';

  const ingredient = ingredients[ingredients.length - 1];
  if (D.isSimpleIngredient(ingredient)) {
    return ingredient[0];
  } else {
    return ingredient.name;
  }
}

export function getVersion(
  modsPath: string,
  factorioPath: string,
): Record<string, string> {
  const modListPath = `${modsPath}/mod-list.json`;
  const modList = getJsonData<D.ModList>(modListPath);
  const playerDataPath = `${factorioPath}/player-data.json`;
  const playerData = getJsonData<D.PlayerData>(playerDataPath);

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
      if (file == null) throw `No mod file found for mod ${mod.name}`;

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

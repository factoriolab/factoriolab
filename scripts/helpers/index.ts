import fs from 'fs';

import { ModHash } from '~/models';

export function getJsonData<T>(file: string, sanitize = false): T {
  let str = fs.readFileSync(file).toString();
  if (sanitize) {
    str = str.replace(/"(.*)":\s?-?inf/g, '"$1": 0');
  }

  return JSON.parse(str) as T;
}

export function coerceArray<T>(
  value: T[] | Record<string, T> | null | undefined
): T[] {
  if (value == null) return [];

  if (Array.isArray(value)) return value;

  const record = value;
  return Object.keys(record).map((k) => record[k]);
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

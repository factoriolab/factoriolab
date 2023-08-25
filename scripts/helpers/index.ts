import fs from 'fs';

export function getJsonData<T>(file: string): T {
  const str = fs.readFileSync(file).toString();
  return JSON.parse(str) as T;
}

export function coerceArray<T>(
  value: T[] | Record<string, T> | null | undefined,
): T[] {
  if (value == null) return [];

  if (Array.isArray(value)) return value;

  const record = value;
  return Object.keys(record).map((k) => record[k]);
}

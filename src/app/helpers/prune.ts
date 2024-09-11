/** Deletes any keys that are undefined */
export function prune<T extends object>(obj: T): T {
  const keys = Object.keys(obj) as (keyof T)[];
  keys
    .filter((k) => obj[k] === undefined)
    .forEach((k) => {
      const { [k]: _, ...remain } = obj;
      obj = remain as T;
    });

  return obj;
}

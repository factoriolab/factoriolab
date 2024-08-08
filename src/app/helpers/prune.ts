/** Deletes any keys that are undefined */
export function prune<T extends object>(obj: T): void {
  (Object.keys(obj) as (keyof T)[])
    .filter((k) => obj[k] === undefined)
    .forEach((k) => delete obj[k]);
}

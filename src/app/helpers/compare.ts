import { Entities } from '~/models';

/** Compare arrays. Empty arrays are considered equal to nullish arrays. */
export function areArraysEqual<T>(
  a: T[] | null | undefined,
  b: T[] | null | undefined,
  compareFn: (a: T, b: T) => boolean = (a, b) => a === b,
): boolean {
  if (!a?.length) return !b?.length;
  if (!b?.length) return false;
  return a.length === b.length && a.every((ae, i) => compareFn(ae, b[i]));
}

export function areEntitiesEqual<T>(
  a: Entities<T> | null | undefined,
  b: Entities<T> | null | undefined,
  compareFn: (a: T, b: T) => boolean = (a, b) => a === b,
): boolean {
  const aKeys = a == null ? null : Object.keys(a);
  const bKeys = b == null ? null : Object.keys(b);
  if (!aKeys?.length) return !bKeys?.length;
  if (!bKeys?.length) return false;
  return (
    aKeys.length === bKeys.length && aKeys.every((k) => compareFn(a![k], b![k]))
  );
}

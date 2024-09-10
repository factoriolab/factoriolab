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
  if (a == null) return b == null || !Object.keys(b).length;
  if (b == null) return !Object.keys(a).length;

  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  return (
    aKeys.length === bKeys.length && aKeys.every((k) => compareFn(a[k], b[k]))
  );
}

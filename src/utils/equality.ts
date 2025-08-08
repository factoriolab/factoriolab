/** Compare arrays. Empty arrays are considered equal to nullish arrays. */
export function areArraysEqual<T>(
  a: T[] | undefined,
  b: T[] | undefined,
  compareFn: (a: T, b: T) => boolean = (a, b) => a === b,
): boolean {
  if (!a?.length) return !b?.length;
  if (!b?.length) return false;
  return a.length === b.length && a.every((ae, i) => compareFn(ae, b[i]));
}

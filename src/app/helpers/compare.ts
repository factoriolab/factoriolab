export function areArraysEqual<T>(
  a: T[] | null | undefined,
  b: T[] | null | undefined,
  compareFn: (a: T, b: T) => boolean,
): boolean {
  if (a == null) return b == null;
  if (b == null) return false;
  return a.length === b.length && a.every((ae, i) => compareFn(ae, b[i]));
}

/** Spread, but ensures type safety of the object to be applied */
export function spread<T>(obj: T, ...apply: Partial<T>[]): T {
  for (const a of apply) obj = { ...obj, ...a };
  return obj;
}

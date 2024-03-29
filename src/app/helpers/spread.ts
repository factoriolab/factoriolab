/** Spread, but ensures type safety of the object to be applied */
export function spread<T>(obj: T, apply: Partial<T>): T {
  return { ...obj, ...apply };
}

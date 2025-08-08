/** Spread, but ensures type safety of the object to be applied */
export function spread<T>(obj: T, ...apply: Partial<T>[]): T {
  if (apply.length === 0) return { ...obj };
  for (const a of apply) obj = { ...obj, ...a };
  return obj;
}

/** Deletes any keys that are undefined */
export function prune(obj: object): void {
  const cast = obj as Record<string, unknown>;
  const keys = Object.keys(cast);
  keys.filter((k) => cast[k] === undefined).forEach((k) => delete cast[k]);
}

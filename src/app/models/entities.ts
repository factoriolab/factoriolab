export type Entities<T = string> = Record<string, T>;

export function toEntities<T extends { id: string }>(
  value: T[],
  init: Entities<T> = {},
  warn = false,
): Entities<T> {
  if (warn) {
    return value.reduce((e: Entities<T>, v) => {
      if (e[v.id]) {
        console.warn(`Duplicate id: ${v.id}`);
      }

      e[v.id] = v;
      return e;
    }, init);
  }
  return value.reduce((e: Entities<T>, v) => {
    e[v.id] = v;
    return e;
  }, init);
}

export function toBoolEntities(
  value: string[],
  init: Entities<boolean> = {},
): Entities<boolean> {
  return value.reduce((e: Entities<boolean>, v) => {
    e[v] = true;
    return e;
  }, init);
}

export type Entities<T> = Record<string, T>;

export function toEntities<T extends { id: string }>(
  value: T[],
  init: Entities<T> = {}
) {
  return value.reduce((e: Entities<T>, v) => {
    e[v.id] = v;
    return e;
  }, init);
}

export function toBoolEntities(value: string[], init: Entities<boolean> = {}) {
  return value.reduce((e: Entities<boolean>, v) => {
    e[v] = true;
    return e;
  }, init);
}

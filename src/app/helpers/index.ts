import { SelectItem } from 'primeng/api';
import { filter, OperatorFunction } from 'rxjs';

import { Entities } from '~/models/entities';
import { ItemId } from '~/models/enum/item-id';
import { Optional } from '~/models/optional';

type PickNonNullish<T, K extends keyof T> = {
  [P in K]-?: NonNullable<T[P]>;
};

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

export function asString(value: Optional<string | string[]>): string {
  if (value == null) return '';
  if (Array.isArray(value)) return value[0];
  return value;
}

/**
 * Function equivalent to `value ?? fallback`. Primarily intended to reduce test
 * branch surface area where nullable values are present.
 */
export function coalesce<T>(value: Optional<T>, fallback: T): T {
  return value ?? fallback;
}

export function contains<T>(entities: Entities<T>, value: T): boolean {
  return Object.keys(entities).some((k) => entities[k] === value);
}

/** Filters an Observable for only values which are not nullish */
export function filterNullish<T>(): OperatorFunction<T, NonNullable<T>> {
  return filter(notNullish);
}

/**
 * Filters an Observable for only values where a specific property of the object
 * is not nullish
 */
export function filterPropsNullish<T, S extends keyof T>(
  ...keys: S[]
): OperatorFunction<T, T & Required<Pick<T, S>>> {
  return filter(fnPropsNotNullish(...keys));
}

/**
 * Returns a function that validates whether specific properties of an object
 * are not nullish
 */
export function fnPropsNotNullish<T, S extends keyof T>(...keys: S[]) {
  return (value: T): value is T & PickNonNullish<T, S> =>
    keys.every((key) => value[key] != null);
}

export function getIdOptions(
  ids: string[],
  entities: Entities<{ name: string }>,
  emptyModule = false,
): SelectItem<string>[] {
  const list = ids.map(
    (i): SelectItem<string> => ({ label: entities[i].name, value: i }),
  );
  if (emptyModule) {
    list.unshift({ label: 'None', value: ItemId.Module });
  }

  return list;
}

/** Simple memoization function for single-input, single-output functions */
export function memoize<I, O>(fn: (i: I) => O): (i: I) => O {
  const cache = new Map<I, O>();
  return (i: I): O => {
    let o = cache.get(i);
    if (o != null) return o;

    o = fn(i);
    cache.set(i, o);
    return o;
  };
}

/** Returns a boolean indicating whether the passed value is not nullish */
export function notNullish<T>(value: T): value is NonNullable<T> {
  return value != null;
}

/**
 * Returns a boolean indicating whether a specific property of an object is not
 * nullish
 */
export function propsNotNullish<T, S extends keyof T>(
  value: T,
  ...keys: S[]
): value is T & Required<Pick<T, S>> {
  return fnPropsNotNullish<T, S>(...keys)(value);
}

/** Deletes any keys that are undefined */
export function prune(obj: object): void {
  const cast = obj as Record<string, unknown>;
  const keys = Object.keys(cast);
  keys.filter((k) => cast[k] === undefined).forEach((k) => delete cast[k]);
}

/** Spread, but ensures type safety of the object to be applied */
export function spread<T>(obj: T, ...apply: Partial<T>[]): T {
  if (apply.length === 0) return { ...obj };
  for (const a of apply) obj = { ...obj, ...a };
  return obj;
}

export function updateSetIds(
  ids: string | string[],
  value: boolean,
  set: string[] | Set<string>,
): Set<string> {
  set = new Set(set);
  if (!Array.isArray(ids)) ids = [ids];
  ids.forEach((id) => {
    if (value) set.add(id);
    else set.delete(id);
  });
  return set;
}

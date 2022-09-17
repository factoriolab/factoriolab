import { filter, OperatorFunction } from 'rxjs';

export * from './browser.utility';
export * from './export.utility';
export * from './rate.utility';
export * from './recipe.utility';
export * from './simplex.utility';
export * from './store.utility';

/** Returns a boolean indicating whether the passed value is not nullish */
export function notNullish<T>(value: T): value is Exclude<T, null | undefined> {
  return value != null;
}

/** Filters an Observable for only values which are not nullish */
export function filterNullish<T>(): OperatorFunction<
  T,
  Exclude<T, null | undefined>
> {
  return filter(notNullish);
}

/**
 * Returns a function that validates whether a specific property of an object is
 * not nullish
 */
export function fnPropNotNullish<T, S extends keyof T>(key: S) {
  return (value: T): value is T & Required<Pick<T, S>> => value[key] != null;
}

/**
 * Returns a boolean indicating whether a specific property of an object is not
 * nullish
 */
export function propNotNullish<T, S extends keyof T>(
  value: T,
  key: S
): value is T & Required<Pick<T, S>> {
  return fnPropNotNullish<T, S>(key)(value);
}

/**
 * Filters an Observable for only values where a specific property of the object
 * is not nullish
 */
export function filterPropNullish<T, S extends keyof T>(
  key: S
): OperatorFunction<T, T & Required<Pick<T, S>>> {
  return filter(fnPropNotNullish(key));
}

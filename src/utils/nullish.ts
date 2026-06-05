import { filter, OperatorFunction } from 'rxjs';

/**
 * Function equivalent to `value ?? fallback`. Primarily intended to reduce test
 * branch surface area where nullable values are present.
 */
export function coalesce<T>(value: T | undefined, fallback: T): T {
  return value ?? fallback;
}

/** Filters an Observable for only values which are not nullish */
export function filterNullish<T>(): OperatorFunction<T, NonNullable<T>> {
  return filter(notNullish);
}

export type PickNonNullish<T, K extends keyof T> = {
  [P in K]-?: NonNullable<T[P]>;
};

/**
 * Returns a function that validates whether specific properties of an object
 * are not nullish
 */
export function fnPropsNotNullish<T, S extends keyof T>(...keys: S[]) {
  return (value: T): value is T & PickNonNullish<T, S> =>
    keys.every((key) => value[key] != null);
}

/** Returns a boolean indicating whether the passed value is not nullish */
export function notNullish<T>(value: T): value is NonNullable<T> {
  return value != null;
}

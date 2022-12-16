import { filter, OperatorFunction } from 'rxjs';

type PickNonNullish<T, K extends keyof T> = {
  [P in K]-?: NonNullable<T[P]>;
};

/** Returns a boolean indicating whether the passed value is not nullish */
export function notNullish<T>(value: T): value is NonNullable<T> {
  return value != null;
}

/** Filters an Observable for only values which are not nullish */
export function filterNullish<T>(): OperatorFunction<T, NonNullable<T>> {
  return filter(notNullish);
}

/**
 * Returns a function that validates whether specific properties of an object
 * are not nullish
 */
export function fnPropsNotNullish<T, S extends keyof T>(...keys: S[]) {
  return (value: T): value is T & PickNonNullish<T, S> =>
    keys.every((key) => value[key] != null);
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

/**
 * Filters an Observable for only values where a specific property of the object
 * is not nullish
 */
export function filterPropsNullish<T, S extends keyof T>(
  ...keys: S[]
): OperatorFunction<T, T & Required<Pick<T, S>>> {
  return filter(fnPropsNotNullish(...keys));
}

import { Nullable } from 'primeng/ts-helpers';

/**
 * Function equivalent to `value ?? fallback`. Primarily intended to reduce test
 * branch surface area where nullable values are present.
 */
export function coalesce<T>(value: Nullable<T>, fallback: T): T {
  return value ?? fallback;
}

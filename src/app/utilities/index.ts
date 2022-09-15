import { filter, OperatorFunction } from 'rxjs';

export * from './browser.utility';
export * from './export.utility';
export * from './rate.utility';
export * from './recipe.utility';
export * from './simplex.utility';
export * from './store.utility';

export function notnullish<T>(): OperatorFunction<
  T,
  Exclude<T, null | undefined>
> {
  return filter(
    (value): value is Exclude<T, null | undefined> => value != null
  );
}

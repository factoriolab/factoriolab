import { isDevMode } from '@angular/core';

import { Rational, rational } from '~/models/rational';

import { spread } from './object';

export function addValueByIds(
  record: Record<string, Rational>,
  ids: string[],
  value: Rational,
): void {
  ids.forEach((id) => {
    if (!record[id]) record[id] = rational.zero;
    record[id] = record[id].add(value);
  });
}

export function cloneRecord<T>(value: Record<string, T>): Record<string, T>;
export function cloneRecord<T>(
  value: Record<string, T> | undefined,
): Record<string, T> | undefined;
export function cloneRecord<T>(
  value: Record<string, T> | undefined,
): Record<string, T> | undefined {
  if (value == null) return;
  return spread(value);
}

export function contains<T>(record: Record<string, T>, value: T): boolean {
  return Object.keys(record).some((k) => record[k] === value);
}

export function reduceRecord(
  value: Record<string, string[]>,
  init: Record<string, Record<string, boolean>> = {},
): Record<string, Record<string, boolean>> {
  return Object.keys(value).reduce(
    (e: Record<string, Record<string, boolean>>, x) => {
      e[x] = toBoolRecord(value[x], init[x]);
      return e;
    },
    init,
  );
}

export function toBoolRecord(
  value: string[],
  init: Record<string, boolean> = {},
): Record<string, boolean> {
  return value.reduce((e: Record<string, boolean>, v) => {
    e[v] = true;
    return e;
  }, init);
}

export function toRationalRecord(
  value: Record<string, string | number>,
): Record<string, Rational>;
export function toRationalRecord(
  value: Record<string, string | number> | undefined,
): Record<string, Rational> | undefined;
export function toRationalRecord(
  value: Record<string, string | number> | undefined,
): Record<string, Rational> | undefined {
  if (value == null) return;
  return Object.keys(value).reduce((e: Record<string, Rational>, v) => {
    e[v] = rational(value[v]);
    return e;
  }, {});
}

export function toRecord<T extends { id: string }>(
  value: T[],
): Record<string, T> {
  if (isDevMode()) {
    return value.reduce((e: Record<string, T>, v) => {
      if (e[v.id]) console.warn(`Duplicate id: ${v.id}`);
      e[v.id] = v;
      return e;
    }, {});
  }

  return value.reduce((e: Record<string, T>, v) => {
    e[v.id] = v;
    return e;
  }, {});
}

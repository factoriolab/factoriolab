import { of } from 'rxjs';

import {
  areArraysEqual,
  areEntitiesEqual,
  asString,
  coalesce,
  contains,
  filterPropsNullish,
  notNullish,
  propsNotNullish,
} from './index';

describe('areArraysEqual', () => {
  it('should check array nullish and length', () => {
    expect(areArraysEqual([], null)).toBeTrue();
    expect(areArraysEqual(null, [])).toBeTrue();
    expect(areArraysEqual(null, null)).toBeTrue();
  });

  it('should check each value', () => {
    expect(areArraysEqual([1, 2], [1, 2])).toBeTrue();
    expect(areArraysEqual([1, 2], [1, 3])).toBeFalse();
  });
});

describe('areEntitiesEqual', () => {
  it('should check entities nullish and key length', () => {
    expect(areEntitiesEqual({}, null)).toBeTrue();
    expect(areEntitiesEqual(null, {})).toBeTrue();
    expect(areEntitiesEqual({ a: 1 }, null)).toBeFalse();
  });

  it('should check each value', () => {
    expect(areEntitiesEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toBeTrue();
    expect(areEntitiesEqual({ a: 1, b: 2 }, { b: 2, a: 3 })).toBeFalse();
  });
});

describe('asString', () => {
  it('should handle various types', () => {
    expect(asString(undefined)).toEqual('');
    expect(asString('string')).toEqual('string');
    expect(asString(['string'])).toEqual('string');
  });
});

describe('coalesce', () => {
  it('should fall back when nullish', () => {
    expect(coalesce(1, 0)).toEqual(1);
    expect(coalesce(null, 0)).toEqual(0);
  });
});

describe('contains', () => {
  it('should determine whether an entities object contains a specific object value', () => {
    expect(contains({ a: 0 }, 0)).toBeTrue();
    expect(contains({ a: 0 }, 1)).toBeFalse();
  });
});

describe('filterPropsNullish', () => {
  it('should filter values where properties are nullish on an object', () => {
    let count = 0;
    of({ a: 'a' }, { a: null })
      .pipe(filterPropsNullish('a'))
      .subscribe(() => count++);
    expect(count).toEqual(1);
  });
});

describe('notNullish', () => {
  it('should evaluate whether an object is nullish', () => {
    expect(notNullish(null)).toEqual(false);
    expect(notNullish(undefined)).toEqual(false);
    expect(notNullish({})).toEqual(true);
  });
});

describe('propsNotNullish', () => {
  it('should return whether properties are nullish on an object', () => {
    expect(propsNotNullish({ a: 'a' }, 'a')).toBeTrue();
    expect(propsNotNullish({ a: null }, 'a')).toBeFalse();
  });
});

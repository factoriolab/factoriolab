import { of } from 'rxjs';

import {
  areArraysEqual,
  areEntitiesEqual,
  asString,
  coalesce,
  compareRank,
  compareSet,
  contains,
  filterPropsNullish,
  notNullish,
  propsNotNullish,
  toBoolEntities,
  toEntities,
} from './index';

const id = 'id';

describe('areArraysEqual', () => {
  it('should check array undefined and length', () => {
    expect(areArraysEqual([], undefined)).toBeTrue();
    expect(areArraysEqual(undefined, [])).toBeTrue();
    expect(areArraysEqual(undefined, undefined)).toBeTrue();
  });

  it('should check each value', () => {
    expect(areArraysEqual([1, 2], [1, 2])).toBeTrue();
    expect(areArraysEqual([1, 2], [1, 3])).toBeFalse();
  });
});

describe('areEntitiesEqual', () => {
  it('should check entities undefined and key length', () => {
    expect(areEntitiesEqual({}, undefined)).toBeTrue();
    expect(areEntitiesEqual(undefined, {})).toBeTrue();
    expect(areEntitiesEqual({ a: 1 }, undefined)).toBeFalse();
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
  it('should fall back when undefined', () => {
    expect(coalesce(1, 0)).toEqual(1);
    expect(coalesce(undefined, 0)).toEqual(0);
  });
});

describe('compareRank', () => {
  it('should return undefined if rank matches', () => {
    expect(compareRank(['a', 'b', 'd'], ['a', 'b', 'c'])).toBeDefined();
    expect(compareRank(['a', 'b', 'c'], ['a', 'b', 'c'])).toBeUndefined();
  });
});

describe('compareRank', () => {
  it('should return undefined if set matches', () => {
    expect(compareSet(new Set([1, 2, 4]), new Set([1, 2, 3]))).toBeDefined();
    expect(compareSet(new Set([1, 2, 3]), new Set([1, 2, 3]))).toBeUndefined();
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

describe('toEntities', () => {
  it('should map id-based objects to an entities object', () => {
    expect(toEntities([{ id }])).toEqual({ [id]: { id } });
  });

  it('should warn about duplicate ids', () => {
    spyOn(console, 'warn');
    toEntities([{ id }, { id }], true);
    expect(console.warn).toHaveBeenCalled();
  });
});

describe('toBoolEntities', () => {
  it('should map a list of strings to a boolean entities object', () => {
    expect(toBoolEntities([id])).toEqual({ [id]: true });
  });
});

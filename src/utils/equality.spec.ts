import { areArraysEqual, areSetsEqual } from './equality';

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

describe('areSetsEqual', () => {
  it('should check array vs set', () => {
    expect(areSetsEqual(new Set(), [])).toBeTrue();
    expect(areSetsEqual([], new Set())).toBeTrue();
  });

  it('should check each value', () => {
    expect(areSetsEqual([1, 2], [1, 2])).toBeTrue();
    expect(areSetsEqual([1, 2], [1, 3])).toBeFalse();
  });
});

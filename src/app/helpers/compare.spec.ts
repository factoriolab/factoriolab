import { areArraysEqual, areEntitiesEqual } from './compare';

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

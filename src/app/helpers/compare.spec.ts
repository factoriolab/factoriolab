import { areArraysEqual } from './compare';

describe('areArraysEqual', () => {
  it('should check array nullish and length', () => {
    expect(areArraysEqual([], null, (): boolean => false)).toBeTrue();
    expect(areArraysEqual(null, [], (): boolean => false)).toBeTrue();
    expect(areArraysEqual(null, null, (): boolean => false)).toBeTrue();
  });

  it('should check each value', () => {
    expect(
      areArraysEqual([1, 2], [1, 2], (a, b): boolean => a === b),
    ).toBeTrue();
    expect(
      areArraysEqual([1, 2], [1, 3], (a, b): boolean => a === b),
    ).toBeFalse();
  });
});

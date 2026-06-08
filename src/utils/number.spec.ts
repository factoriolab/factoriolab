import { rational } from '~/rational/rational';

import { clamp, inRange, toNumber } from './number';

describe('toNumber', () => {
  it('should convert values of different types to number', () => {
    expect(toNumber(rational.one)).toEqual(1);
    expect(toNumber('1')).toEqual(1);
    expect(toNumber(1)).toEqual(1);
  });
});

describe('inRange', () => {
  it('should handle null values', () => {
    expect(inRange(rational.one, rational.zero, undefined)).toBeTrue();
    expect(inRange(rational.zero, rational.one, undefined)).toBeFalse();
    expect(inRange(rational.zero, undefined, rational.one)).toBeTrue();
    expect(inRange(rational.one, undefined, rational.zero)).toBeFalse();
  });
});

describe('clamp', () => {
  it('should clamp values within a range', () => {
    expect(clamp(0, 5, 10)).toEqual(5);
    expect(clamp(10, 0, 5)).toEqual(5);
    expect(clamp(5, 0, 10)).toEqual(5);
  });
});

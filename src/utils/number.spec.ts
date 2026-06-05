import { rational } from '~/rational/rational';

import { inRange, toNumber } from './number';

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

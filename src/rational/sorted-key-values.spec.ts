import { rational } from './rational';
import { sortedKeyValues } from './sorted-key-values';

describe('sortedKeyValues', () => {
  it('should sort the key-value pairs in a record', () => {
    expect(
      sortedKeyValues({ a: rational(2n), b: rational(4n), c: rational(3n) }),
    ).toEqual([
      ['b', rational(4n)],
      ['c', rational(3n)],
      ['a', rational(2n)],
    ]);
  });
});

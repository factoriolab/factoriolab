import { rational } from '~/rational/rational';

import {
  reduceRecord,
  sortedKeyValues,
  toBoolRecord,
  toRecord,
} from './record';

const id = 'id';

describe('reduceRecord', () => {
  it('should reduce a record of strings to a map of boolean records', () => {
    expect(reduceRecord({ a: ['b', 'c'] })).toEqual({
      a: { b: true, c: true },
    });
  });
});

describe('toBoolRecord', () => {
  it('should map a list of strings to a boolean record object', () => {
    expect(toBoolRecord([id])).toEqual({ [id]: true });
  });
});

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

describe('toRecord', () => {
  it('should map id-based objects to an Record object', () => {
    expect(toRecord([{ id }])).toEqual({ id: { id } });
  });

  it('should warn about duplicate ids', () => {
    spyOn(console, 'warn');
    toRecord([{ id }, { id }]);
    expect(console.warn).toHaveBeenCalled();
  });
});

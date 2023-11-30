import { orEmpty, orString, orZero } from './nullish-chaining';

describe('orZero', () => {
  it('should fall back to zero value', () => {
    expect(orZero(1)).toEqual(1);
    expect(orZero(null)).toEqual(0);
  });
});

describe('orString', () => {
  it('should fall back to empty string value', () => {
    expect(orString('a')).toEqual('a');
    expect(orString(null)).toEqual('');
  });
});

describe('orEmpty', () => {
  it('should fall back to empty array value', () => {
    expect(orEmpty([0])).toEqual([0]);
    expect(orEmpty(null)).toEqual([]);
  });
});

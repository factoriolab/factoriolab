import { coalesce, fnPropsNotNullish, notNullish } from './nullish';

describe('coalesce', () => {
  it('should fall back when undefined', () => {
    expect(coalesce(1, 0)).toEqual(1);
    expect(coalesce(undefined, 0)).toEqual(0);
  });
});

describe('propsNotNullish', () => {
  it('should return whether properties are nullish on an object', () => {
    expect(fnPropsNotNullish<{ a?: string }, 'a'>('a')({ a: 'a' })).toBeTrue();
    expect(
      fnPropsNotNullish<{ a?: string | null }, 'a'>('a')({ a: null }),
    ).toBeFalse();
  });
});

describe('notNullish', () => {
  it('should evaluate whether an object is nullish', () => {
    expect(notNullish(null)).toEqual(false);
    expect(notNullish(undefined)).toEqual(false);
    expect(notNullish({})).toEqual(true);
  });
});

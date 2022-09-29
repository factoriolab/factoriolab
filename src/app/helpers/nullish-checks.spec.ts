import { of } from 'rxjs';

import {
  filterPropsNullish,
  notNullish,
  propsNotNullish,
} from './nullish-checks';

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

describe('filterPropsNullish', () => {
  it('should filter values where properties are nullish on an object', () => {
    let count = 0;
    of({ a: 'a' }, { a: null })
      .pipe(filterPropsNullish('a'))
      .subscribe(() => count++);
    expect(count).toEqual(1);
  });
});

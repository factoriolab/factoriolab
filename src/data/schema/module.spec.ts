import { rational } from '~/rational/rational';

import { filterEffect } from './module';

describe('filterEffect', () => {
  it('should return true if a module does not have a matching "good" effect', () => {
    expect(
      filterEffect({ consumption: rational.one }, 'consumption'),
    ).toBeTrue();
    expect(
      filterEffect({ consumption: rational(-1n) }, 'consumption'),
    ).toBeFalse();
  });
});

import { rational } from '~/rational/rational';

import { areBeaconSettingsEqual } from './beacon-settings';

describe('areBeaconSettingsEqual', () => {
  it('should compare beacon settings', () => {
    expect(
      areBeaconSettingsEqual(
        { count: rational.one, id: 'id', modules: [], total: rational(2n) },
        { count: rational.one, id: 'id', modules: [], total: rational(2n) },
      ),
    ).toBeTrue();
    expect(
      areBeaconSettingsEqual(
        { count: rational.one, id: 'id', modules: [], total: rational(2n) },
        { count: rational.one, id: 'id', modules: [], total: rational(3n) },
      ),
    ).toBeFalse();
  });
});

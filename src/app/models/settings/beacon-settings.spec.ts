import { Mocks } from '~/tests';

import { areBeaconSettingsEqual } from './beacon-settings';

describe('areBeaconSettingsEqual', () => {
  it('should validate all properties', () => {
    expect(
      areBeaconSettingsEqual(Mocks.beaconSettings[0], Mocks.beaconSettings[0]),
    ).toBeTrue();
    expect(areBeaconSettingsEqual(Mocks.beaconSettings[0], {})).toBeFalse();
  });
});

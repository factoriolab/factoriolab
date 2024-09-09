import { Mocks } from 'src/tests';

import { areBeaconSettingsEqual } from './beacon-settings';

describe('areBeaconSettingsEqual', () => {
  it('should validate all properties', () => {
    expect(
      areBeaconSettingsEqual(Mocks.BeaconSettings[0], Mocks.BeaconSettings[0]),
    ).toBeTrue();
    expect(areBeaconSettingsEqual(Mocks.BeaconSettings[0], {})).toBeFalse();
  });
});

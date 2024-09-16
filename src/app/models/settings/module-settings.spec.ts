import { Mocks } from '~/tests';

import { areModuleSettingsEqual } from './module-settings';

describe('areModuleSettingsEqual', () => {
  it('should validate all properties', () => {
    expect(
      areModuleSettingsEqual(Mocks.moduleSettings[0], Mocks.moduleSettings[0]),
    ).toBeTrue();
    expect(areModuleSettingsEqual(Mocks.moduleSettings[0], {})).toBeFalse();
  });
});

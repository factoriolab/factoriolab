import { Mocks } from '~/tests';

import { areModuleSettingsEqual } from './module-settings';

describe('areModuleSettingsEqual', () => {
  it('should validate all properties', () => {
    expect(
      areModuleSettingsEqual(Mocks.ModuleSettings[0], Mocks.ModuleSettings[0]),
    ).toBeTrue();
    expect(areModuleSettingsEqual(Mocks.ModuleSettings[0], {})).toBeFalse();
  });
});

import { areArraysEqual } from '~/helpers';

import { Rational } from '../rational';
import { areModuleSettingsEqual, ModuleSettings } from './module-settings';

export interface BeaconSettings {
  count?: Rational;
  id?: string;
  modules?: ModuleSettings[];
  total?: Rational;
}

export function areBeaconSettingsEqual(
  a: BeaconSettings,
  b: BeaconSettings,
): boolean {
  return (
    a.count?.toString() === b.count?.toString() &&
    a.id === b.id &&
    areArraysEqual(a.modules, b.modules, areModuleSettingsEqual) &&
    a.total?.toString() === b.total?.toString()
  );
}

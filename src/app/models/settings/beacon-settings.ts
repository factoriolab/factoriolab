import { SelectItem } from 'primeng/api';

import { isArrayEqual } from '~/helpers';
import { Rational } from '../rational';
import { isModuleSettingsEqual, ModuleSettings } from './module-settings';

export interface BeaconSettings {
  count: Rational;
  id: string;
  modules: ModuleSettings[];
  /** Calculated, not configurable */
  moduleOptions?: SelectItem[];
  total?: Rational;
}

export function isBeaconSettingsEqual(
  a: BeaconSettings,
  b: BeaconSettings,
): boolean {
  return (
    a.count.eq(b.count) &&
    a.id === b.id &&
    isArrayEqual(a.modules, b.modules, isModuleSettingsEqual) &&
    (a.total == null || (b.total != null && a.total.eq(b.total)))
  );
}

export function beaconSettingsPayload(
  value: BeaconSettings[] | undefined,
  def: BeaconSettings[] | undefined,
): BeaconSettings[] | undefined {
  return isArrayEqual(value, def, isBeaconSettingsEqual) ? undefined : value;
}

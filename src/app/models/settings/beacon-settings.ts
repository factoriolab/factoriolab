import { SelectItem } from 'primeng/api';

import { Rational } from '../rational';
import { ModuleSettings } from './module-settings';

export interface BeaconSettings {
  count?: Rational;
  id?: string;
  modules?: ModuleSettings[];
  /** Calculated, not configurable */
  moduleOptions?: SelectItem[];
  total?: Rational;
}

export function beaconSettingsPayload(
  value: BeaconSettings[],
  def: BeaconSettings[] | undefined,
  count: Rational,
  id: string,
): BeaconSettings[] | undefined {
  if (JSON.stringify(value) === JSON.stringify(def)) return undefined;
  return value.map((v) => ({
    count: v.count?.eq(count) ? undefined : v.count,
    id: v.id === id ? undefined : v.id,
  }));
}

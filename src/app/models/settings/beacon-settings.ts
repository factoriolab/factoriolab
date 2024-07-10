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
  value: BeaconSettings[] | undefined,
  def: BeaconSettings[] | undefined,
): BeaconSettings[] | undefined {
  if (JSON.stringify(value) === JSON.stringify(def)) return undefined;

  // TODO: Compare individual beacon entries and mark properties as `undefined`
  // where properties match defaults

  return value;
}

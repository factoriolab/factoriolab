import { SelectItem } from 'primeng/api';

import { Rational } from '../rational';
import { BeaconSettings } from './beacon-settings';
import { ModuleSettings } from './module-settings';

export interface MachineSettings {
  fuelId?: string;
  /** Calculated, not configurable */
  fuelOptions?: SelectItem<string>[];
  modules?: ModuleSettings[];
  /** Calculated, not configurable */
  moduleOptions?: SelectItem<string>[];
  beacons?: BeaconSettings[];
  overclock?: Rational;
}

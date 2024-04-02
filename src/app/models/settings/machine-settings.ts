import { SelectItem } from 'primeng/api';

import { Rational } from '../rational';

export interface MachineSettings {
  fuelId?: string;
  /** Calculated, not configurable */
  fuelOptions?: SelectItem<string>[];
  moduleRankIds?: string[];
  /** Calculated, not configurable */
  moduleOptions?: SelectItem[];
  beaconCount?: Rational;
  beaconId?: string;
  beaconModuleRankIds?: string[];
  /** Calculated, not configurable */
  beaconModuleOptions?: SelectItem<string>[];
  overclock?: Rational;
}

import { SelectItem } from 'primeng/api';

import { Rational } from '../rational';
import { BeaconCfg, BeaconRtlCfg } from './beacon-config';

/** Recipe configuration */
export interface RecipeCfg {
  excluded?: boolean;
  checked?: boolean;
  machineId?: string;
  machineModuleIds?: string[];
  /** Calculated, not configurable */
  machineModuleOptions?: SelectItem[];
  beacons?: BeaconCfg[];
  overclock?: number;
  cost?: string;
}

/** Recipe rational configuration */
export class RecipeRtlCfg {
  excluded?: boolean;
  checked?: boolean;
  machineId?: string;
  machineModuleIds?: string[];
  /** Calculated, not configurable */
  machineModuleOptions?: SelectItem[];
  beacons?: BeaconRtlCfg[];
  overclock?: Rational;
  cost?: Rational;

  constructor(obj: RecipeCfg) {
    if (obj.excluded != null) {
      this.excluded = obj.excluded;
    }
    if (obj.checked != null) {
      this.checked = obj.checked;
    }
    if (obj.machineId != null) {
      this.machineId = obj.machineId;
    }
    if (obj.machineModuleIds != null) {
      this.machineModuleIds = obj.machineModuleIds;
    }
    if (obj.machineModuleOptions != null) {
      this.machineModuleOptions = obj.machineModuleOptions;
    }
    if (obj.beacons) {
      this.beacons = obj.beacons.map((b) => new BeaconRtlCfg(b));
    }
    if (obj.overclock != null) {
      this.overclock = Rational.fromNumber(obj.overclock);
    }
    if (obj.cost != null) {
      this.cost = Rational.fromString(obj.cost);
    }
  }
}

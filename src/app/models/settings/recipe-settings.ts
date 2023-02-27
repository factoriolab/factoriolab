import { SelectItem } from 'primeng/api';

import { Rational } from '../rational';
import { BeaconSettings, RationalBeaconSettings } from './beacon-settings';

export interface RecipeSettings {
  machineId?: string;
  machineModuleIds?: string[];
  /** Calculated, not configurable */
  machineModuleOptions?: SelectItem[];
  beacons?: BeaconSettings[];
  overclock?: number;
  cost?: string;
  checked?: boolean;
}

export class RationalRecipeSettings {
  machineId?: string;
  machineModuleIds?: string[];
  /** Calculated, not configurable */
  machineModuleOptions?: SelectItem[];
  beacons?: RationalBeaconSettings[];
  overclock?: Rational;
  cost?: Rational;
  checked?: boolean;

  constructor(obj: RecipeSettings) {
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
      this.beacons = obj.beacons.map((b) => new RationalBeaconSettings(b));
    }
    if (obj.overclock != null) {
      this.overclock = Rational.fromNumber(obj.overclock);
    }
    if (obj.cost != null) {
      this.cost = Rational.fromString(obj.cost);
    }
    if (obj.checked != null) {
      this.checked = obj.checked;
    }
  }
}

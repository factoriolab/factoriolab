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

  constructor(data: RecipeSettings) {
    if (data.machineId != null) {
      this.machineId = data.machineId;
    }
    if (data.machineModuleIds != null) {
      this.machineModuleIds = data.machineModuleIds;
    }
    if (data.machineModuleOptions != null) {
      this.machineModuleOptions = data.machineModuleOptions;
    }
    if (data.beacons) {
      this.beacons = data.beacons.map((b) => new RationalBeaconSettings(b));
    }
    if (data.overclock != null) {
      this.overclock = Rational.fromNumber(data.overclock);
    }
    if (data.cost != null) {
      this.cost = Rational.fromString(data.cost);
    }
    if (data.checked != null) {
      this.checked = data.checked;
    }
  }
}

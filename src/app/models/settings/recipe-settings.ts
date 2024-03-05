import { SelectItem } from 'primeng/api';

import { Rational } from '../rational';
import { BeaconRationalSettings, BeaconSettings } from './beacon-settings';

export interface RecipeSettings {
  excluded?: boolean;
  checked?: boolean;
  machineId?: string;
  fuelId?: string;
  /** Calculated, not configurable */
  fuelOptions?: SelectItem<string>[];
  machineModuleIds?: string[];
  /** Calculated, not configurable */
  machineModuleOptions?: SelectItem<string>[];
  beacons?: BeaconSettings[];
  overclock?: number;
  cost?: string;
}

export class RecipeSettingsRational {
  excluded?: boolean;
  checked?: boolean;
  machineId?: string;
  fuelId?: string;
  /** Calculated, not configurable */
  fuelOptions?: SelectItem<string>[];
  machineModuleIds?: string[];
  /** Calculated, not configurable */
  machineModuleOptions?: SelectItem<string>[];
  beacons?: BeaconRationalSettings[];
  overclock?: Rational;
  cost?: Rational;

  constructor(obj: RecipeSettings) {
    this.excluded = obj.excluded;
    this.checked = obj.checked;
    this.machineId = obj.machineId;
    this.fuelId = obj.fuelId;
    this.fuelOptions = obj.fuelOptions;
    this.machineModuleIds = obj.machineModuleIds;
    this.machineModuleOptions = obj.machineModuleOptions;

    if (obj.beacons) {
      this.beacons = obj.beacons.map((b) => new BeaconRationalSettings(b));
    }

    if (obj.overclock != null) {
      this.overclock = Rational.fromNumber(obj.overclock);
    }

    if (obj.cost != null) {
      this.cost = Rational.fromString(obj.cost);
    }
  }
}

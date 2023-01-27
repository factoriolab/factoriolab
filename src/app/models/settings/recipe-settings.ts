import { SelectItem } from 'primeng/api';

import { Rational } from '../rational';
import { BeaconSettings, RationalBeaconSettings } from './beacon-settings';

export interface RecipeSettings {
  factoryId?: string;
  factoryModuleIds?: string[];
  /** Calculated, not configurable */
  factoryModuleOptions?: SelectItem[];
  beacons?: BeaconSettings[];
  overclock?: number;
  cost?: string;
}

export class RationalRecipeSettings {
  factoryId?: string;
  factoryModuleIds?: string[];
  /** Calculated, not configurable */
  factoryModuleOptions?: SelectItem[];
  beacons?: RationalBeaconSettings[];
  overclock?: Rational;
  cost?: Rational;

  constructor(data: RecipeSettings) {
    if (data.factoryId != null) {
      this.factoryId = data.factoryId;
    }
    if (data.factoryModuleIds != null) {
      this.factoryModuleIds = data.factoryModuleIds;
    }
    if (data.factoryModuleOptions != null) {
      this.factoryModuleOptions = data.factoryModuleOptions;
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
  }
}

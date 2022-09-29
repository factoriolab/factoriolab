import { SelectItem } from 'primeng/api';

import { Rational } from '../rational';

export interface RecipeSettings {
  factoryId?: string;
  factoryModuleIds?: string[];
  /** Calculated, not configurable */
  factoryModuleOptions?: SelectItem[];
  beaconCount?: string;
  beaconId?: string;
  beaconModuleIds?: string[];
  /** Calculated, not configurable */
  beaconModuleOptions?: SelectItem[];
  beaconTotal?: string;
  overclock?: number;
  cost?: string;
}

export class RationalRecipeSettings {
  factoryId?: string;
  factoryModuleIds?: string[];
  /** Calculated, not configurable */
  factoryModuleOptions?: SelectItem[];
  beaconCount?: Rational;
  beaconId?: string;
  beaconModuleIds?: string[];
  /** Calculated, not configurable */
  beaconModuleOptions?: SelectItem[];
  beaconTotal?: Rational;
  overclock?: Rational;
  cost?: Rational;

  constructor(data: RecipeSettings) {
    if (data.factoryId != null) {
      this.factoryId = data.factoryId;
    }
    if (data.factoryModuleIds != null) {
      this.factoryModuleIds = data.factoryModuleIds;
    }
    if (data.factoryModuleOptions) {
      this.factoryModuleOptions = data.factoryModuleOptions;
    }
    if (data.beaconCount != null) {
      this.beaconCount = Rational.fromString(data.beaconCount);
    }
    if (data.beaconId != null) {
      this.beaconId = data.beaconId;
    }
    if (data.beaconModuleIds != null) {
      this.beaconModuleIds = data.beaconModuleIds;
    }
    if (data.beaconModuleOptions) {
      this.beaconModuleOptions = data.beaconModuleOptions;
    }
    if (data.beaconTotal != null) {
      this.beaconTotal = Rational.fromString(data.beaconTotal);
    }
    if (data.overclock != null) {
      this.overclock = Rational.fromNumber(data.overclock);
    }
    if (data.cost != null) {
      this.cost = Rational.fromString(data.cost);
    }
  }
}

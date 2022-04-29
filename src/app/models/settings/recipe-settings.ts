import { Rational } from '../rational';

export interface RecipeSettings {
  factoryId?: string;
  factoryModuleIds?: string[];
  beaconCount?: string;
  beaconId?: string;
  beaconModuleIds?: string[];
  beaconTotal?: string;
  overclock?: number;
  cost?: string;
}

export class RationalRecipeSettings {
  factoryId?: string;
  factoryModuleIds?: string[];
  beaconCount?: Rational;
  beaconId?: string;
  beaconModuleIds?: string[];
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
    if (data.beaconCount != null) {
      this.beaconCount = Rational.fromString(data.beaconCount);
    }
    if (data.beaconId != null) {
      this.beaconId = data.beaconId;
    }
    if (data.beaconModuleIds != null) {
      this.beaconModuleIds = data.beaconModuleIds;
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

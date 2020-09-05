import { Rational } from './rational';

export enum RecipeSettingsField {
  Factory = 'factory',
  FactoryModules = 'factoryModules',
  Beacon = 'beacon',
  BeaconModules = 'beaconModules',
  BeaconCount = 'beaconCount',
}

export interface RecipeSettings {
  factory?: string;
  factoryModules?: string[];
  beacon?: string;
  beaconModules?: string[];
  beaconCount?: number;
}

export class RationalRecipeSettings {
  factory?: string;
  factoryModules?: string[];
  beacon?: string;
  beaconModules?: string[];
  beaconCount?: Rational;

  constructor(data: RecipeSettings) {
    if (data.factory != null) {
      this.factory = data.factory;
    }
    if (data.factoryModules != null) {
      this.factoryModules = data.factoryModules;
    }
    if (data.beacon != null) {
      this.beacon = data.beacon;
    }
    if (data.beaconModules != null) {
      this.beaconModules = data.beaconModules;
    }
    if (data.beaconCount != null) {
      this.beaconCount = Rational.fromNumber(data.beaconCount);
    }
  }
}

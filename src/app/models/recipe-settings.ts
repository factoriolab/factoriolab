import { Rational } from './rational';

export enum RecipeSettingsField {
  Factory = 'factory',
  Modules = 'modules',
  BeaconModule = 'beaconModule',
  BeaconCount = 'beaconCount',
}

export interface RecipeSettings {
  factory?: string;
  modules?: string[];
  beaconModule?: string;
  beaconCount?: number;
}

export class RationalRecipeSettings {
  factory?: string;
  modules?: string[];
  beaconModule?: string;
  beaconCount?: Rational;

  constructor(data: RecipeSettings) {
    if (data.factory != null) {
      this.factory = data.factory;
    }
    if (data.modules != null) {
      this.modules = data.modules;
    }
    if (data.beaconModule != null) {
      this.beaconModule = data.beaconModule;
    }
    if (data.beaconCount != null) {
      this.beaconCount = Rational.fromNumber(data.beaconCount);
    }
  }
}

import Fraction from 'fraction.js';

export interface RecipeSettings {
  ignore: boolean;
  belt?: string;
  factory?: string;
  modules?: string[];
  beaconType?: string;
  beaconCount?: number;
}

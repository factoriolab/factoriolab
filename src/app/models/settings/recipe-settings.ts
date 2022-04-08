import { Rational } from '../rational';

export interface RecipeSettings {
  factory: string;
  factoryModules: string[];
  beaconCount: string;
  beacon: string;
  beaconModules: string[];
  beaconTotal: string;
  overclock: number;
  cost: string;
}

export class RationalRecipeSettings {
  factory: string;
  factoryModules: string[];
  beaconCount: Rational;
  beacon: string;
  beaconModules: string[];
  beaconTotal: Rational;
  overclock: Rational;
  cost: Rational;

  constructor(data: RecipeSettings) {
    this.factory = data.factory;
    this.factoryModules = data.factoryModules;
    this.beaconCount = Rational.fromString(data.beaconCount);
    this.beacon = data.beacon;
    this.beaconModules = data.beaconModules;
    this.beaconTotal = Rational.fromString(data.beaconTotal);
    this.overclock = Rational.fromNumber(data.overclock);
    this.cost = Rational.fromString(data.cost);
  }
}

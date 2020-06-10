import { ItemId } from './data/item';
import { Rational } from './math/rational';

export interface RecipeSettings {
  factory?: ItemId;
  modules?: ItemId[];
  beaconModule?: ItemId;
  beaconCount?: number;
}

export class RationalRecipeSettings {
  factory?: ItemId;
  modules?: ItemId[];
  beaconModule?: ItemId;
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

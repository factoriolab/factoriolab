import { ItemId } from './data/item';
import { Rational } from './rational';

export interface RecipeSettings {
  ignore?: boolean;
  belt?: ItemId;
  factory?: ItemId;
  modules?: ItemId[];
  beaconModule?: ItemId;
  beaconCount?: number;
}

export class RationalRecipeSettings {
  ignore?: boolean;
  belt?: ItemId;
  factory?: ItemId;
  modules?: ItemId[];
  beaconModule?: ItemId;
  beaconCount?: Rational;

  constructor(data: RecipeSettings) {
    if (data.ignore != null) {
      this.ignore = data.ignore;
    }
    if (data.belt != null) {
      this.belt = data.belt;
    }
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

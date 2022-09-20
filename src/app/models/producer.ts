import { SelectItem } from 'primeng/api';

import { RationalRecipe } from './data';
import { Rational } from './rational';

export interface Producer {
  id: string;
  recipeId: string;
  count: string;
  factoryId?: string;
  factoryModuleIds?: string[];
  /** Calculated, not configurable */
  factoryModuleOptions?: SelectItem[];
  beaconCount?: string;
  beaconId?: string;
  beaconModuleIds?: string[];
  /** Calculated, not configurable */
  beaconModuleOptions?: SelectItem[];
  overclock?: number;
}

export class RationalProducer {
  id: string;
  recipeId: string;
  count: Rational;
  factoryId?: string;
  factoryModuleIds?: string[];
  /** Calculated, not configurable */
  factoryModuleOptions?: SelectItem[];
  beaconCount?: Rational;
  beaconId?: string;
  beaconModuleIds?: string[];
  /** Calculated, not configurable */
  beaconModuleOptions?: SelectItem[];
  overclock?: Rational;
  recipe: RationalRecipe;

  constructor(data: Producer, recipe: RationalRecipe) {
    this.id = data.id;
    this.recipeId = data.recipeId;
    this.count = Rational.fromString(data.count);
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
    if (data.overclock != null) {
      this.overclock = Rational.fromNumber(data.overclock);
    }
    this.recipe = recipe;
  }
}

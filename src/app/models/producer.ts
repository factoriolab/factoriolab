import { SelectItem } from 'primeng/api';

import { RationalRecipe } from './data';
import { Rational } from './rational';
import { BeaconSettings, RationalBeaconSettings } from './settings';

export interface Producer {
  id: string;
  recipeId: string;
  count: string;
  factoryId?: string;
  factoryModuleIds?: string[];
  /** Calculated, not configurable */
  factoryModuleOptions?: SelectItem[];
  beacons?: BeaconSettings[];
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
  beacons?: RationalBeaconSettings[];
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
    if (data.factoryModuleOptions != null) {
      this.factoryModuleOptions = data.factoryModuleOptions;
    }
    if (data.beacons) {
      this.beacons = data.beacons.map((b) => new RationalBeaconSettings(b));
    }
    if (data.overclock != null) {
      this.overclock = Rational.fromNumber(data.overclock);
    }
    this.recipe = recipe;
  }
}

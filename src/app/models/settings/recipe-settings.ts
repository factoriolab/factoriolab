import { SelectItem } from 'primeng/api';

import { Rational } from '../rational';
import { BeaconSettings, BeaconSettingsRational } from './beacon-settings';
import { ModuleSettings } from './module-settings';

export interface RecipeSettings {
  excluded?: boolean;
  checked?: boolean;
  machineId?: string;
  fuelId?: string;
  /** Calculated, not configurable */
  fuelOptions?: SelectItem<string>[];
  modules?: ModuleSettings[];
  /** Calculated, not configurable */
  moduleOptions?: SelectItem<string>[];
  beacons?: BeaconSettings[];
  overclock?: number;
  cost?: string;
}

export class RecipeSettingsRational {
  excluded?: boolean;
  checked?: boolean;
  machineId?: string;
  fuelId?: string;
  /** Calculated, not configurable */
  fuelOptions?: SelectItem<string>[];
  modules?: ModuleSettings[];
  /** Calculated, not configurable */
  moduleOptions?: SelectItem<string>[];
  beacons?: BeaconSettingsRational[];
  overclock?: Rational;
  cost?: Rational;

  constructor(obj: RecipeSettings) {
    this.excluded = obj.excluded;
    this.checked = obj.checked;
    this.machineId = obj.machineId;
    this.fuelId = obj.fuelId;
    this.fuelOptions = obj.fuelOptions;
    this.modules = obj.modules;
    this.moduleOptions = obj.moduleOptions;
    this.beacons = obj.beacons?.map((b) => new BeaconSettingsRational(b));
    this.overclock = Rational.from(obj.overclock);
    this.cost = Rational.from(obj.cost);
  }
}

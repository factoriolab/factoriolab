import { SelectItem } from 'primeng/api';

import { Rational } from '../rational';
import { BeaconSettings } from './beacon-settings';
import { ModuleSettings } from './module-settings';

export interface RecipeState {
  machineId?: string;
  fuelId?: string;
  modules?: ModuleSettings[];
  beacons?: BeaconSettings[];
  overclock?: Rational;
  cost?: Rational;
}

export interface RecipeSettings extends RecipeState {
  fuelOptions?: SelectItem<string>[];
  moduleOptions?: SelectItem<string>[];
}

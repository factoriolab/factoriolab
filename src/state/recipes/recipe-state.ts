import { Rational } from '~/models/rational';

import { BeaconSettings } from '../beacon-settings';
import { ModuleSettings } from '../module-settings';

export interface RecipeState {
  machineId?: string;
  fuelId?: string;
  modules?: ModuleSettings[];
  beacons?: BeaconSettings[];
  overclock?: Rational;
  cost?: Rational;
  productivity?: Rational;
}

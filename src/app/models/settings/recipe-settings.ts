import { Option } from '../option';
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
  productivity?: Rational;
}

export interface RecipeSettings extends RecipeState {
  defaultMachineId?: string;
  defaultFuelId?: string;
  machineOptions?: Option[];
  fuelOptions?: Option[];
  moduleOptions?: Option[];
  defaultOverclock?: Rational;
}

import { SelectItem } from 'primeng/api';

import { Rational } from '../rational';
import { BeaconSettings } from './beacon-settings';
import { ModuleSettings } from './module-settings';

export interface MachineState {
  fuelId?: string;
  modules?: ModuleSettings[];
  beacons?: BeaconSettings[];
  overclock?: Rational;
}

export interface MachineSettings extends MachineState {
  defaultFuelId?: string;
  fuelOptions?: SelectItem<string>[];
  moduleOptions?: SelectItem<string>[];
  defaultOverclock?: Rational;
}

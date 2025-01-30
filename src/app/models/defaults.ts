import { Rational } from './rational';
import { BeaconSettings } from './settings/beacon-settings';

export interface Defaults {
  beltId?: string;
  beltStack?: Rational;
  locations?: string[];
  pipeId?: string;
  fuelRankIds: string[];
  cargoWagonId?: string;
  fluidWagonId?: string;
  excludedRecipeIds: string[];
  machineRankIds: string[];
  moduleRankIds: string[];
  beacons: BeaconSettings[];
  overclock?: Rational;
}

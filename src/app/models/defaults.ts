import { BeaconSettings } from './settings';

export interface Defaults {
  beltId?: string;
  pipeId?: string;
  cargoWagonId?: string;
  fluidWagonId?: string;
  excludedRecipeIds: string[];
  fuelRankIds: string[];
  machineRankIds: string[];
  moduleRankIds: string[];
  beacons: BeaconSettings[];
  overclock?: number;
}

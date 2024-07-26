import { BeaconSettings } from './settings';

export interface Defaults {
  beltId?: string;
  pipeId?: string;
  fuelRankIds: string[];
  cargoWagonId?: string;
  fluidWagonId?: string;
  excludedRecipeIds: string[];
  machineRankIds: string[];
  moduleRankIds: string[];
  beacons: BeaconSettings[];
}

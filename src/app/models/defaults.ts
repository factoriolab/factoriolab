import { Rational } from './rational';

export interface Defaults {
  beltId: string;
  pipeId?: string;
  fuelId: string;
  cargoWagonId: string;
  fluidWagonId: string;
  excludedRecipeIds: string[];
  machineRankIds: string[];
  moduleRankIds: string[];
  beaconCount: Rational;
  beaconId: string;
  beaconModuleId: string;
}

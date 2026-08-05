import { Rational } from '~/rational/rational';

import { BeaconSettings } from '../beacon-settings';

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
  miningBonus?: Rational;
  researchBonus?: Rational;
  researchProductivity?: Rational;
  researchedTechnologyIds?: Set<string>;
  // TODO: This default is not yet applied to recipe settings
  recipeProductivity?: Partial<Record<string, Rational>>;
}

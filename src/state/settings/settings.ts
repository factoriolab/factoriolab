import { Quality } from '~/data/schema/quality';
import { Rational } from '~/rational/rational';

import { SettingsState } from './settings-state';

export interface Settings extends Omit<
  SettingsState,
  | 'stack'
  | 'excludedRecipeIds'
  | 'miningBonus'
  | 'researchSpeed'
  | 'researchedTechnologyIds'
> {
  defaultBeltId?: string;
  defaultPipeId?: string;
  defaultCargoWagonId?: string;
  defaultFluidWagonId?: string;
  stack: Rational;
  excludedRecipeIds: Set<string>;
  defaultExcludedRecipeIds: Set<string>;
  recipeBonus: Partial<Record<string, Rational>>;
  machineRankIds: string[];
  defaultMachineRankIds: string[];
  fuelRankIds: string[];
  defaultFuelRankIds: string[];
  moduleRankIds: string[];
  defaultModuleRankIds: string[];
  miningBonus: Rational;
  researchBonus: Rational;
  researchedTechnologyIds: Set<string>;
  locationIds: Set<string>;
  defaultLocationIds: Set<string>;
  availableRecipeIds: Set<string>;
  availableItemIds: Set<string>;
  quality: Quality;
}

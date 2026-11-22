import { Quality } from '~/data/schema/quality';
import { Rational } from '~/rational/rational';

import { SettingsState } from './settings-state';

export interface Settings extends SettingsState {
  beltRankIds: string[];
  defaultBeltRankIds: string[];
  wagonRankIds: string[];
  defaultWagonRankIds: string[];
  stack: Rational;
  excludedRecipeIds: Set<string>;
  defaultExcludedRecipeIds: Set<string>;
  recipeBonus: Partial<Record<string, Rational>>;
  recipeCostMultiplier: Rational;
  machineRankIds: string[];
  defaultMachineRankIds: string[];
  fuelRankIds: string[];
  defaultFuelRankIds: string[];
  moduleRankIds: string[];
  defaultModuleRankIds: string[];
  miningBonus: Rational;
  researchBonus: Rational;
  researchProductivity: Rational;
  inserterBonus: Partial<Record<string, Rational>>;
  researchedTechnologyIds: Set<string>;
  locationIds: Set<string>;
  defaultLocationIds: Set<string>;
  /** Recipes that are available at the current technology level */
  availableRecipeIds: Set<string>;
  /** Items that are available at the current technology level */
  availableItemIds: Set<string>;
  quality?: Quality;
}

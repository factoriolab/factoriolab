import { SettingsState } from '~/store/settings';

export interface SettingsComplete
  extends Omit<SettingsState, 'excludedRecipeIds' | 'researchedTechnologyIds'> {
  excludedRecipeIds: Set<string>;
  machineRankIds: string[];
  fuelRankIds: string[];
  moduleRankIds: string[];
  researchedTechnologyIds: Set<string>;
}

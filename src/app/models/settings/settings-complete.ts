import { SettingsState } from '~/store/settings/settings.reducer';

export interface SettingsComplete
  extends Omit<SettingsState, 'excludedRecipeIds' | 'researchedTechnologyIds'> {
  excludedRecipeIds: Set<string>;
  machineRankIds: string[];
  fuelRankIds: string[];
  moduleRankIds: string[];
  researchedTechnologyIds: Set<string>;
}

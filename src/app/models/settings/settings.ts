import { SettingsState } from '~/store/settings.service';

import { Quality } from '../enum/quality';

export interface Settings
  extends Omit<SettingsState, 'excludedRecipeIds' | 'researchedTechnologyIds'> {
  defaultBeltId?: string;
  defaultPipeId?: string;
  defaultCargoWagonId?: string;
  defaultFluidWagonId?: string;
  excludedRecipeIds: Set<string>;
  defaultExcludedRecipeIds: Set<string>;
  machineRankIds: string[];
  defaultMachineRankIds: string[];
  fuelRankIds: string[];
  defaultFuelRankIds: string[];
  moduleRankIds: string[];
  defaultModuleRankIds: string[];
  researchedTechnologyIds: Set<string>;
  locationIds: Set<string>;
  defaultLocationIds: Set<string>;
  availableRecipeIds: Set<string>;
  availableItemIds: Set<string>;
  quality: Quality;
}

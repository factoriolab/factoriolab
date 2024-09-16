import { LabState } from '~/store';
import { loadMod } from '~/store/datasets/datasets.actions';
import { datasetsReducer } from '~/store/datasets/datasets.reducer';
import { initialItemsState } from '~/store/items/items.reducer';
import { initialMachinesState } from '~/store/machines/machines.reducer';
import { initialObjectivesState } from '~/store/objectives/objectives.reducer';
import { initialPreferencesState } from '~/store/preferences/preferences.reducer';
import { initialRecipesState } from '~/store/recipes/recipes.reducer';
import { initialSettingsState } from '~/store/settings/settings.reducer';

import { Mocks } from './';

const datasetsState = datasetsReducer(
  undefined,
  loadMod({
    id: initialSettingsState.modId,
    i18nId: initialSettingsState.modId,
    data: Mocks.modData,
    hash: Mocks.modHash,
    i18n: undefined,
  }),
);

export const initialState: LabState = {
  datasetsState,
  objectivesState: initialObjectivesState,
  itemsState: initialItemsState,
  recipesState: initialRecipesState,
  machinesState: initialMachinesState,
  settingsState: initialSettingsState,
  preferencesState: initialPreferencesState,
};

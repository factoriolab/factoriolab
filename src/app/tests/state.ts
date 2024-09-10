import {
  Datasets,
  Items,
  LabState,
  Machines,
  Objectives,
  Preferences,
  Recipes,
  Settings,
} from '~/store';

import { Mocks } from './';

const datasetsState = Datasets.datasetsReducer(
  undefined,
  Datasets.loadMod({
    id: Settings.initialState.modId,
    i18nId: Settings.initialState.modId,
    data: Mocks.Data,
    hash: Mocks.Hash,
    i18n: undefined,
  }),
);

export const initialState: LabState = {
  datasetsState,
  objectivesState: Objectives.initialState,
  itemsState: Items.initialState,
  recipesState: Recipes.initialState,
  machinesState: Machines.initialState,
  settingsState: Settings.initialState,
  preferencesState: Preferences.initialState,
};

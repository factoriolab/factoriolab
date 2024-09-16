import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { storeFreeze } from 'ngrx-store-freeze';
import { environment } from 'src/environments/environment';

import { datasetsReducer, DatasetsState } from './datasets/datasets.reducer';
import { itemsReducer, ItemsState } from './items/items.reducer';
import { machinesReducer, MachinesState } from './machines/machines.reducer';
import {
  objectivesReducer,
  ObjectivesState,
} from './objectives/objectives.reducer';
import {
  preferencesReducer,
  PreferencesState,
} from './preferences/preferences.reducer';
import { recipesReducer, RecipesState } from './recipes/recipes.reducer';
import { settingsReducer, SettingsState } from './settings/settings.reducer';
import { storageMetaReducer } from './storage.reducer';

export interface LabState {
  datasetsState: DatasetsState;
  objectivesState: ObjectivesState;
  itemsState: ItemsState;
  recipesState: RecipesState;
  machinesState: MachinesState;
  settingsState: SettingsState;
  preferencesState: PreferencesState;
}

export const reducers = {
  datasetsState: datasetsReducer,
  objectivesState: objectivesReducer,
  itemsState: itemsReducer,
  recipesState: recipesReducer,
  machinesState: machinesReducer,
  settingsState: settingsReducer,
  preferencesState: preferencesReducer,
} as ActionReducerMap<LabState>;

/* No need to test without storeFreeze, ignore that branch here. */
export const metaReducers: MetaReducer<LabState>[] = environment.testing
  ? [storeFreeze]
  : /* istanbul ignore next */
    environment.production
    ? [storageMetaReducer]
    : [storeFreeze, storageMetaReducer];

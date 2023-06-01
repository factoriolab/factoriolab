import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { storeFreeze } from 'ngrx-store-freeze';

import { environment } from 'src/environments/environment';
import * as App from './app.actions';
import * as Datasets from './datasets';
import * as Items from './items';
import * as Machines from './machines';
import * as Objectives from './objectives';
import * as Preferences from './preferences';
import * as Recipes from './recipes';
import * as Settings from './settings';
import { storageMetaReducer } from './storage.reducer';

export interface LabState {
  datasetsState: Datasets.DatasetsState;
  objectivesState: Objectives.ObjectivesState;
  itemsState: Items.ItemsState;
  recipesState: Recipes.RecipesState;
  machinesState: Machines.MachinesState;
  settingsState: Settings.SettingsState;
  preferencesState: Preferences.PreferencesState;
}

export const reducers: ActionReducerMap<LabState, never> = {
  datasetsState: Datasets.datasetsReducer,
  objectivesState: Objectives.objectivesReducer,
  itemsState: Items.itemsReducer,
  recipesState: Recipes.recipesReducer,
  machinesState: Machines.machinesReducer,
  settingsState: Settings.settingsReducer,
  preferencesState: Preferences.preferencesReducer,
};

/* No need to test without storeFreeze, ignore that branch here. */
export const metaReducers: MetaReducer<LabState>[] = environment.testing
  ? [storeFreeze]
  : /* istanbul ignore next */
  environment.production
  ? [storageMetaReducer]
  : [storeFreeze, storageMetaReducer];

export {
  App,
  Datasets,
  Items,
  Machines,
  Objectives,
  Preferences,
  Recipes,
  Settings,
};

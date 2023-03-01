import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { storeFreeze } from 'ngrx-store-freeze';

import { environment } from 'src/environments/environment';
import * as App from './app.actions';
import * as Datasets from './datasets';
import * as ItemObjectives from './item-objectives';
import * as Items from './items';
import * as Machines from './machines';
import * as Preferences from './preferences';
import * as RecipeObjectives from './recipe-objectives';
import * as Recipes from './recipes';
import * as Settings from './settings';
import { storageMetaReducer } from './storage.reducer';

export interface LabState {
  datasetsState: Datasets.DatasetsState;
  itemObjectivesState: ItemObjectives.ItemObjectivesState;
  recipeObjectivesState: RecipeObjectives.RecipeObjectivesState;
  itemsState: Items.ItemsState;
  recipesState: Recipes.RecipesState;
  machinesState: Machines.MachinesState;
  settingsState: Settings.SettingsState;
  preferencesState: Preferences.PreferencesState;
}

export const reducers: ActionReducerMap<LabState, never> = {
  datasetsState: Datasets.datasetsReducer,
  itemObjectivesState: ItemObjectives.itemObjectivesReducer,
  recipeObjectivesState: RecipeObjectives.recipeObjectivesReducer,
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
  ItemObjectives,
  Items,
  Machines,
  Preferences,
  RecipeObjectives,
  Recipes,
  Settings,
};

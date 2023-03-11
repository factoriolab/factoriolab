import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { storeFreeze } from 'ngrx-store-freeze';

import { environment } from 'src/environments/environment';
import * as App from './app.actions';
import * as Datasets from './datasets';
import * as ItemsCfg from './item-configs';
import * as ItemsObj from './item-objectives';
import * as MachinesCfg from './machine-configs';
import * as Preferences from './preferences';
import * as RecipesCfg from './recipe-configs';
import * as RecipesObj from './recipe-objectives';
import * as Settings from './settings';
import { storageMetaReducer } from './storage.reducer';

export interface LabState {
  datasetsState: Datasets.DatasetsState;
  itemsObjState: ItemsObj.ItemsObjState;
  recipesObjState: RecipesObj.RecipesObjState;
  itemsCfgState: ItemsCfg.ItemsCfgState;
  recipesCfgState: RecipesCfg.RecipesCfgState;
  machinesCfgState: MachinesCfg.MachinesCfgState;
  settingsState: Settings.SettingsState;
  preferencesState: Preferences.PreferencesState;
}

export const reducers: ActionReducerMap<LabState, never> = {
  datasetsState: Datasets.datasetsReducer,
  itemsObjState: ItemsObj.itemsObjReducer,
  recipesObjState: RecipesObj.recipesObjReducer,
  itemsCfgState: ItemsCfg.itemsCfgReducer,
  recipesCfgState: RecipesCfg.recipesCfgReducer,
  machinesCfgState: MachinesCfg.machinesCfgReducer,
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
  ItemsObj,
  ItemsCfg,
  MachinesCfg,
  Preferences,
  RecipesObj,
  RecipesCfg,
  Settings,
};

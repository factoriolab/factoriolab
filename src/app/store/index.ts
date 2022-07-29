import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { storeFreeze } from 'ngrx-store-freeze';

import { environment } from 'src/environments/environment';
import * as App from './app.actions';
import * as Datasets from './datasets';
import * as Factories from './factories';
import * as Items from './items';
import * as Preferences from './preferences';
import * as Products from './products';
import * as Recipes from './recipes';
import * as Settings from './settings';
import { storageMetaReducer } from './storage.reducer';

export interface LabState {
  datasetsState: Datasets.DatasetsState;
  productsState: Products.ProductsState;
  itemsState: Items.ItemsState;
  recipesState: Recipes.RecipesState;
  factoriesState: Factories.FactoriesState;
  settingsState: Settings.SettingsState;
  preferencesState: Preferences.PreferencesState;
}

export const reducers: ActionReducerMap<LabState, any> = {
  datasetsState: Datasets.datasetsReducer,
  productsState: Products.productsReducer,
  itemsState: Items.itemsReducer,
  recipesState: Recipes.recipesReducer,
  factoriesState: Factories.factoriesReducer,
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
  Factories,
  Items,
  Preferences,
  Products,
  Recipes,
  Settings,
};

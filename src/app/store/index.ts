import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { storeFreeze } from 'ngrx-store-freeze';

import { environment } from 'src/environments/environment';
import { datasetsReducer, DatasetsState } from './datasets';
import { factoriesReducer, FactoriesState } from './factories';
import { itemsReducer, ItemsState } from './items';
import { preferencesReducer, PreferencesState } from './preferences';
import { productsReducer, ProductsState } from './products';
import { recipesReducer, RecipesState } from './recipes';
import { settingsReducer, SettingsState } from './settings';
import { storageMetaReducer } from './storage.reducer';

export interface LabState {
  datasetsState: DatasetsState;
  productsState: ProductsState;
  itemsState: ItemsState;
  recipesState: RecipesState;
  factoriesState: FactoriesState;
  settingsState: SettingsState;
  preferencesState: PreferencesState;
}

export const reducers: ActionReducerMap<LabState, any> = {
  datasetsState: datasetsReducer,
  productsState: productsReducer,
  itemsState: itemsReducer,
  recipesState: recipesReducer,
  factoriesState: factoriesReducer,
  settingsState: settingsReducer,
  preferencesState: preferencesReducer,
};

/* No need to test without storeFreeze, ignore that branch here. */
export const metaReducers: MetaReducer<LabState>[] = environment.testing
  ? [storeFreeze]
  : /* istanbul ignore next */
  environment.production
  ? [storageMetaReducer]
  : [storeFreeze, storageMetaReducer];

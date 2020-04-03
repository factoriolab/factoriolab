import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { storeFreeze } from 'ngrx-store-freeze';

import { environment } from 'src/environments/environment';
import { DatasetState, datasetReducer } from './dataset';
import { ProductsState, productsReducer } from './products';
import { RecipeState, recipeReducer } from './recipe';
import { SettingsState, settingsReducer } from './settings';

export interface State {
  datasetState: DatasetState;
  productsState: ProductsState;
  recipeState: RecipeState;
  settingsState: SettingsState;
}

export const reducers: ActionReducerMap<State> = {
  datasetState: datasetReducer,
  productsState: productsReducer,
  recipeState: recipeReducer,
  settingsState: settingsReducer
};

/* No need to test without storeFreeze, ignore that branch here. */
export const metaReducers: MetaReducer<State>[] = !environment.production
  ? [storeFreeze]
  : /* istanbul ignore next */
    [];

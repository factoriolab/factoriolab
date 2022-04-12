import { Action } from '@ngrx/store';

import { DatasetsState } from './datasets';
import { FactoriesState } from './factories';
import { ItemsState } from './items';
import { ProductsState } from './products';
import { RecipesState } from './recipes';
import { SettingsState } from './settings';

export interface PartialState {
  datasetsState?: DatasetsState;
  productsState?: ProductsState;
  itemsState?: ItemsState;
  recipesState?: RecipesState;
  factoriesState?: FactoriesState;
  settingsState?: Partial<SettingsState>;
}

export enum AppActionType {
  LOAD = '[App] Load',
  RESET = '[App] Reset',
}

export class LoadAction implements Action {
  readonly type = AppActionType.LOAD;
  constructor(public payload: PartialState) {}
}

export class ResetAction implements Action {
  readonly type = AppActionType.RESET;
}

export type AppAction = LoadAction | ResetAction;

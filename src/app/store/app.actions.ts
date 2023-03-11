import { Action } from '@ngrx/store';

import { DatasetsState } from './datasets';
import { ItemsCfgState } from './item-configs';
import { ItemsObjState } from './item-objectives';
import { MachinesCfgState } from './machine-configs';
import { RecipesCfgState } from './recipe-configs';
import { RecipesObjState } from './recipe-objectives';
import { PartialSettingsState } from './settings';

export interface PartialState {
  datasetsState?: DatasetsState;
  itemsObjState?: ItemsObjState;
  recipesObjState?: RecipesObjState;
  itemsCfgState?: ItemsCfgState;
  recipesCfgState?: RecipesCfgState;
  machinesCfgState?: MachinesCfgState;
  settingsState?: PartialSettingsState;
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

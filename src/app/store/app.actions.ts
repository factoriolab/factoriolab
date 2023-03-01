import { Action } from '@ngrx/store';

import { DatasetsState } from './datasets';
import { ItemObjectivesState } from './item-objectives';
import { ItemsState } from './items';
import { MachinesState } from './machines';
import { RecipeObjectivesState } from './recipe-objectives';
import { RecipesState } from './recipes';
import { SettingsState } from './settings';

export interface PartialState {
  datasetsState?: DatasetsState;
  itemObjectivesState?: ItemObjectivesState;
  recipeObjectivesState?: RecipeObjectivesState;
  itemsState?: ItemsState;
  recipesState?: RecipesState;
  machinesState?: MachinesState;
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

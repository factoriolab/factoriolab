import { Action } from '@ngrx/store';

import { DatasetsState } from './datasets';
import { ItemsState } from './items';
import { MachinesState } from './machines';
import { ObjectivesState } from './objectives';
import { RecipesState } from './recipes';
import { PartialSettingsState } from './settings';

export interface PartialState {
  datasetsState?: DatasetsState;
  objectivesState?: ObjectivesState;
  itemsState?: ItemsState;
  recipesState?: RecipesState;
  machinesState?: MachinesState;
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

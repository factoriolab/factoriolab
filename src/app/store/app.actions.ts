import { Action } from '@ngrx/store';

import { State } from '.';

export enum AppActionType {
  LOAD = '[App] Load',
  RESET = '[App] Reset',
}

export class LoadAction implements Action {
  readonly type = AppActionType.LOAD;
  constructor(public payload: State) {}
}

export class ResetAction implements Action {
  readonly type = AppActionType.RESET;
}

export type AppAction = LoadAction | ResetAction;

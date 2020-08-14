import { Action } from '@ngrx/store';

import { State } from '.';

export enum AppActionType {
  LOAD = '[App Router] Load',
}

export class AppLoadAction implements Action {
  readonly type = '[App Router] Load';
  constructor(public payload: State) {}
}

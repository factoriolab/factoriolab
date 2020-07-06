import { Action } from '@ngrx/store';

import { ItemsState } from './items.reducer';
import { IdPayload } from '~/models';

export const enum ItemsActionType {
  LOAD = '[Items Router] Load',
  IGNORE = '[Items Page] Ignore Item',
  SET_BELT = '[Items Page] Set Belt',
  RESET = '[Items Page] Reset Item',
  RESET_IGNORE = '[Items Page] Reset Ignore',
  RESET_BELT = '[Items Page] Reset Belt',
}

export class LoadAction implements Action {
  readonly type = ItemsActionType.LOAD;
  constructor(public payload: ItemsState) {}
}

export class IgnoreAction implements Action {
  readonly type = ItemsActionType.IGNORE;
  constructor(public payload: string) {}
}

export class SetBeltAction implements Action {
  readonly type = ItemsActionType.SET_BELT;
  constructor(public payload: IdPayload<string>) {}
}

export class ResetAction implements Action {
  readonly type = ItemsActionType.RESET;
  constructor(public payload: string) {}
}

export class ResetIgnoreAction implements Action {
  readonly type = ItemsActionType.RESET_IGNORE;
}

export class ResetBeltAction implements Action {
  readonly type = ItemsActionType.RESET_BELT;
}

export type ItemsAction =
  | LoadAction
  | IgnoreAction
  | SetBeltAction
  | ResetAction
  | ResetIgnoreAction
  | ResetBeltAction;

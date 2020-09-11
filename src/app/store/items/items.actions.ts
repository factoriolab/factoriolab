import { Action } from '@ngrx/store';

import { DefaultIdPayload } from '~/models';

export const enum ItemsActionType {
  IGNORE = '[Items] Ignore Item',
  SET_BELT = '[Items] Set Belt',
  RESET = '[Items] Reset Item',
  RESET_IGNORE = '[Items] Reset Ignore',
  RESET_BELT = '[Items] Reset Belt',
}

export class IgnoreAction implements Action {
  readonly type = ItemsActionType.IGNORE;
  constructor(public payload: string) {}
}

export class SetBeltAction implements Action {
  readonly type = ItemsActionType.SET_BELT;
  constructor(public payload: DefaultIdPayload) {}
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
  | IgnoreAction
  | SetBeltAction
  | ResetAction
  | ResetIgnoreAction
  | ResetBeltAction;

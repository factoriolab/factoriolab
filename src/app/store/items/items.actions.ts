import { Action } from '@ngrx/store';

import { DefaultIdPayload } from '~/models';

export const enum ItemsActionType {
  IGNORE_ITEM = '[Items] Ignore Item',
  SET_BELT = '[Items] Set Belt',
  RESET_ITEM = '[Items] Reset Item',
  RESET_IGNORE = '[Items] Reset Ignore',
  RESET_BELT = '[Items] Reset Belt',
}

export class IgnoreItemAction implements Action {
  readonly type = ItemsActionType.IGNORE_ITEM;
  constructor(public payload: string) {}
}

export class SetBeltAction implements Action {
  readonly type = ItemsActionType.SET_BELT;
  constructor(public payload: DefaultIdPayload) {}
}

export class ResetItemAction implements Action {
  readonly type = ItemsActionType.RESET_ITEM;
  constructor(public payload: string) {}
}

export class ResetIgnoreAction implements Action {
  readonly type = ItemsActionType.RESET_IGNORE;
}

export class ResetBeltAction implements Action {
  readonly type = ItemsActionType.RESET_BELT;
}

export type ItemsAction =
  | IgnoreItemAction
  | SetBeltAction
  | ResetItemAction
  | ResetIgnoreAction
  | ResetBeltAction;

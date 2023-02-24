import { Action } from '@ngrx/store';

import { IdDefaultPayload, IdPayload } from '~/models';

export const enum ItemsActionType {
  IGNORE_ITEM = '[Items] Ignore Item',
  SET_BELT = '[Items] Set Belt',
  SET_WAGON = '[Items] Set Wagon',
  SET_CHECKED = '[Items] Set Checked',
  RESET_ITEM = '[Items] Reset Item',
  RESET_IGNORES = '[Items] Reset Ignores',
  RESET_BELTS = '[Items] Reset Belts',
  RESET_WAGONS = '[Items] Reset Wagon',
  RESET_CHECKED = '[Items] Reset Checked',
}

export class IgnoreItemAction implements Action {
  readonly type = ItemsActionType.IGNORE_ITEM;
  constructor(public payload: string) {}
}

export class SetBeltAction implements Action {
  readonly type = ItemsActionType.SET_BELT;
  constructor(public payload: IdDefaultPayload) {}
}

export class SetWagonAction implements Action {
  readonly type = ItemsActionType.SET_WAGON;
  constructor(public payload: IdDefaultPayload) {}
}

export class SetCheckedAction implements Action {
  readonly type = ItemsActionType.SET_CHECKED;
  constructor(public payload: IdPayload<boolean>) {}
}

export class ResetItemAction implements Action {
  readonly type = ItemsActionType.RESET_ITEM;
  constructor(public payload: string) {}
}

export class ResetIgnoresAction implements Action {
  readonly type = ItemsActionType.RESET_IGNORES;
}

export class ResetBeltsAction implements Action {
  readonly type = ItemsActionType.RESET_BELTS;
}

export class ResetWagonsAction implements Action {
  readonly type = ItemsActionType.RESET_WAGONS;
}

export class ResetCheckedAction implements Action {
  readonly type = ItemsActionType.RESET_CHECKED;
}

export type ItemsAction =
  | IgnoreItemAction
  | SetBeltAction
  | SetWagonAction
  | SetCheckedAction
  | ResetItemAction
  | ResetIgnoresAction
  | ResetBeltsAction
  | ResetWagonsAction
  | ResetCheckedAction;

import { Action } from '@ngrx/store';

import { IdValueDefaultPayload, IdValuePayload } from '~/models';

export const enum ItemsActionType {
  SET_EXCLUDED = '[Items] Set Excluded',
  SET_EXCLUDED_BATCH = '[Items] Set Excluded Batch',
  SET_CHECKED = '[Items] Set Checked',
  SET_BELT = '[Items] Set Belt',
  SET_WAGON = '[Items] Set Wagon',
  RESET_ITEM = '[Items] Reset Item',
  RESET_EXCLUDED = '[Items] Reset Excluded',
  RESET_CHECKED = '[Items] Reset Checked',
  RESET_BELTS = '[Items] Reset Belts',
  RESET_WAGONS = '[Items] Reset Wagon',
}

export class SetExcludedAction implements Action {
  readonly type = ItemsActionType.SET_EXCLUDED;
  constructor(public payload: IdValuePayload<boolean>) {}
}

export class SetExcludedBatchAction implements Action {
  readonly type = ItemsActionType.SET_EXCLUDED_BATCH;
  constructor(public payload: IdValuePayload<boolean>[]) {}
}

export class SetCheckedAction implements Action {
  readonly type = ItemsActionType.SET_CHECKED;
  constructor(public payload: IdValuePayload<boolean>) {}
}

export class SetBeltAction implements Action {
  readonly type = ItemsActionType.SET_BELT;
  constructor(public payload: IdValueDefaultPayload) {}
}

export class SetWagonAction implements Action {
  readonly type = ItemsActionType.SET_WAGON;
  constructor(public payload: IdValueDefaultPayload) {}
}

export class ResetItemAction implements Action {
  readonly type = ItemsActionType.RESET_ITEM;
  constructor(public payload: string) {}
}

export class ResetExcludedAction implements Action {
  readonly type = ItemsActionType.RESET_EXCLUDED;
}

export class ResetCheckedAction implements Action {
  readonly type = ItemsActionType.RESET_CHECKED;
}

export class ResetBeltsAction implements Action {
  readonly type = ItemsActionType.RESET_BELTS;
}

export class ResetWagonsAction implements Action {
  readonly type = ItemsActionType.RESET_WAGONS;
}

export type ItemsAction =
  | SetExcludedAction
  | SetExcludedBatchAction
  | SetCheckedAction
  | SetBeltAction
  | SetWagonAction
  | ResetItemAction
  | ResetExcludedAction
  | ResetCheckedAction
  | ResetBeltsAction
  | ResetWagonsAction;

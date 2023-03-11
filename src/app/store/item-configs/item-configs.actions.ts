import { Action } from '@ngrx/store';

import { IdDefaultPayload, IdPayload } from '~/models';

export const enum ItemsCfgActionType {
  SET_EXCLUDED = '[Item Configs] Set Excluded',
  SET_EXCLUDED_BATCH = '[Item Configs] Set Excluded Batch',
  SET_CHECKED = '[Item Configs] Set Checked',
  SET_BELT = '[Item Configs] Set Belt',
  SET_WAGON = '[Item Configs] Set Wagon',
  RESET_ITEM = '[Item Configs] Reset Item',
  RESET_EXCLUDED = '[Item Configs] Reset Excluded',
  RESET_CHECKED = '[Item Configs] Reset Checked',
  RESET_BELTS = '[Item Configs] Reset Belts',
  RESET_WAGONS = '[Item Configs] Reset Wagon',
}

export class SetExcludedAction implements Action {
  readonly type = ItemsCfgActionType.SET_EXCLUDED;
  constructor(public payload: IdPayload<boolean>) {}
}

export class SetExcludedBatchAction implements Action {
  readonly type = ItemsCfgActionType.SET_EXCLUDED_BATCH;
  constructor(public payload: IdPayload<boolean>[]) {}
}

export class SetCheckedAction implements Action {
  readonly type = ItemsCfgActionType.SET_CHECKED;
  constructor(public payload: IdPayload<boolean>) {}
}

export class SetBeltAction implements Action {
  readonly type = ItemsCfgActionType.SET_BELT;
  constructor(public payload: IdDefaultPayload) {}
}

export class SetWagonAction implements Action {
  readonly type = ItemsCfgActionType.SET_WAGON;
  constructor(public payload: IdDefaultPayload) {}
}
export class ResetItemAction implements Action {
  readonly type = ItemsCfgActionType.RESET_ITEM;
  constructor(public payload: string) {}
}

export class ResetExcludedAction implements Action {
  readonly type = ItemsCfgActionType.RESET_EXCLUDED;
}

export class ResetCheckedAction implements Action {
  readonly type = ItemsCfgActionType.RESET_CHECKED;
}

export class ResetBeltsAction implements Action {
  readonly type = ItemsCfgActionType.RESET_BELTS;
}

export class ResetWagonsAction implements Action {
  readonly type = ItemsCfgActionType.RESET_WAGONS;
}

export type ItemsCfgAction =
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

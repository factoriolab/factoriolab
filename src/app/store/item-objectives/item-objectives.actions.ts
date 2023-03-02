import { Action } from '@ngrx/store';

import { AmountType, IdPayload, ItemObjective } from '~/models';

export const enum ItemObjectivesActionType {
  ADD = '[Item Objectives] Add',
  CREATE = '[Item Objectives] Create',
  REMOVE = '[Item Objectives] Remove',
  SET_ITEM = '[Item Objectives] Set Item',
  SET_AMOUNT = '[Item Objectives] Set Amount',
  SET_AMOUNT_TYPE = '[Item Objectives] Set Amount Type',
  ADJUST_DISPLAY_RATE = '[Item Objectives] Adjust Display Rate',
}

export class AddAction implements Action {
  readonly type = ItemObjectivesActionType.ADD;
  constructor(public payload: string) {}
}

export class CreateAction implements Action {
  readonly type = ItemObjectivesActionType.CREATE;
  constructor(public payload: ItemObjective) {}
}

export class RemoveAction implements Action {
  readonly type = ItemObjectivesActionType.REMOVE;
  constructor(public payload: string) {}
}

export class SetItemAction implements Action {
  readonly type = ItemObjectivesActionType.SET_ITEM;
  constructor(public payload: IdPayload) {}
}

export class SetAmountAction implements Action {
  readonly type = ItemObjectivesActionType.SET_AMOUNT;
  constructor(public payload: IdPayload) {}
}

export class SetAmountTypeAction implements Action {
  readonly type = ItemObjectivesActionType.SET_AMOUNT_TYPE;
  constructor(public payload: IdPayload<AmountType>) {}
}

export class AdjustDisplayRateAction implements Action {
  readonly type = ItemObjectivesActionType.ADJUST_DISPLAY_RATE;
  constructor(public payload: string) {}
}

export type ItemObjectivesAction =
  | AddAction
  | CreateAction
  | RemoveAction
  | SetItemAction
  | SetAmountAction
  | SetAmountTypeAction
  | AdjustDisplayRateAction;

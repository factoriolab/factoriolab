import { Action } from '@ngrx/store';

import { IdPayload, ItemObj, ObjectiveType, RateUnit } from '~/models';

export const enum ItemsObjActionType {
  ADD = '[Item Objectives] Add',
  CREATE = '[Item Objectives] Create',
  REMOVE = '[Item Objectives] Remove',
  SET_ITEM = '[Item Objectives] Set Item',
  SET_RATE = '[Item Objectives] Set Rate',
  SET_RATE_UNIT = '[Item Objectives] Set Rate Unit',
  SET_TYPE = '[Item Objectives] Set Type',
  ADJUST_DISPLAY_RATE = '[Item Objectives] Adjust Display Rate',
}

export class AddAction implements Action {
  readonly type = ItemsObjActionType.ADD;
  constructor(public payload: string) {}
}

export class CreateAction implements Action {
  readonly type = ItemsObjActionType.CREATE;
  constructor(public payload: ItemObj) {}
}

export class RemoveAction implements Action {
  readonly type = ItemsObjActionType.REMOVE;
  constructor(public payload: string) {}
}

export class SetItemAction implements Action {
  readonly type = ItemsObjActionType.SET_ITEM;
  constructor(public payload: IdPayload) {}
}

export class SetRateAction implements Action {
  readonly type = ItemsObjActionType.SET_RATE;
  constructor(public payload: IdPayload) {}
}

export class SetRateUnitAction implements Action {
  readonly type = ItemsObjActionType.SET_RATE_UNIT;
  constructor(public payload: IdPayload<RateUnit>) {}
}

export class SetTypeAction implements Action {
  readonly type = ItemsObjActionType.SET_TYPE;
  constructor(public payload: IdPayload<ObjectiveType>) {}
}

export class AdjustDisplayRateAction implements Action {
  readonly type = ItemsObjActionType.ADJUST_DISPLAY_RATE;
  constructor(public payload: string) {}
}

export type ItemsObjAction =
  | AddAction
  | CreateAction
  | RemoveAction
  | SetItemAction
  | SetRateAction
  | SetRateUnitAction
  | SetTypeAction
  | AdjustDisplayRateAction;

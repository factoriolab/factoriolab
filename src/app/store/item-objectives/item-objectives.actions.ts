import { Action } from '@ngrx/store';

import { IdPayload, ItemObjective, ObjectiveType, RateUnit } from '~/models';

export const enum ItemObjectivesActionType {
  ADD = '[Item Objectives] Add',
  CREATE = '[Item Objectives] Create',
  REMOVE = '[Item Objectives] Remove',
  SET_ITEM = '[Item Objectives] Set Item',
  SET_RATE = '[Item Objectives] Set Rate',
  SET_RATE_UNIT = '[Item Objectives] Set Rate Unit',
  SET_TYPE = '[Item Objectives] Set Type',
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

export class SetRateAction implements Action {
  readonly type = ItemObjectivesActionType.SET_RATE;
  constructor(public payload: IdPayload) {}
}

export class SetRateUnitAction implements Action {
  readonly type = ItemObjectivesActionType.SET_RATE_UNIT;
  constructor(public payload: IdPayload<RateUnit>) {}
}

export class SetTypeAction implements Action {
  readonly type = ItemObjectivesActionType.SET_TYPE;
  constructor(public payload: IdPayload<ObjectiveType>) {}
}

export type ItemObjectivesAction =
  | AddAction
  | CreateAction
  | RemoveAction
  | SetItemAction
  | SetRateAction
  | SetRateUnitAction
  | SetTypeAction;

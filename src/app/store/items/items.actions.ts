import { Action } from '@ngrx/store';

import { DefaultIdPayload } from '~/models';

export const enum ItemsActionType {
  IGNORE_ITEM = '[Items] Ignore Item',
  SET_BELT = '[Items] Set Belt',
  SET_WAGON = '[Items] Set Wagon',
  SET_RECIPE = '[Items] Set Recipe',
  RESET_ITEM = '[Items] Reset Item',
  RESET_IGNORE = '[Items] Reset Ignore',
  RESET_BELT = '[Items] Reset Belt',
  RESET_WAGON = '[Items] Reset Wagon',
}

export class IgnoreItemAction implements Action {
  readonly type = ItemsActionType.IGNORE_ITEM;
  constructor(public payload: string) {}
}

export class SetBeltAction implements Action {
  readonly type = ItemsActionType.SET_BELT;
  constructor(public payload: DefaultIdPayload) {}
}

export class SetWagonAction implements Action {
  readonly type = ItemsActionType.SET_WAGON;
  constructor(public payload: DefaultIdPayload) {}
}

export class SetRecipeAction implements Action {
  readonly type = ItemsActionType.SET_RECIPE;
  constructor(public payload: DefaultIdPayload<string | undefined>) {}
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

export class ResetWagonAction implements Action {
  readonly type = ItemsActionType.RESET_WAGON;
}

export type ItemsAction =
  | IgnoreItemAction
  | SetBeltAction
  | SetWagonAction
  | SetRecipeAction
  | ResetItemAction
  | ResetIgnoreAction
  | ResetBeltAction
  | ResetWagonAction;

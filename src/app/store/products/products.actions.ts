import { Action } from '@ngrx/store';

import { IdPayload, RateType } from '~/models';

export const enum ProductsActionType {
  ADD = '[Products] Add',
  REMOVE = '[Products] Remove',
  SET_ITEM = '[Products] Set Item',
  SET_RATE = '[Products] Set Rate',
  SET_RATE_TYPE = '[Products] Set Rate Type',
  SET_VIA = '[Products] Set Via',
  RESET_VIA = '[Products] Reset Via',
  ADJUST_DISPLAY_RATE = '[Products] Adjust Display Rate',
}

export class AddAction implements Action {
  readonly type = ProductsActionType.ADD;
  constructor(public payload: string) {}
}

export class RemoveAction implements Action {
  readonly type = ProductsActionType.REMOVE;
  constructor(public payload: string) {}
}

export class SetItemAction implements Action {
  readonly type = ProductsActionType.SET_ITEM;
  constructor(public payload: IdPayload) {}
}

export class SetRateAction implements Action {
  readonly type = ProductsActionType.SET_RATE;
  constructor(public payload: IdPayload) {}
}

export class SetRateTypeAction implements Action {
  readonly type = ProductsActionType.SET_RATE_TYPE;
  constructor(public payload: IdPayload<RateType>) {}
}

export class SetViaAction implements Action {
  readonly type = ProductsActionType.SET_VIA;
  constructor(public payload: IdPayload) {}
}

export class ResetViaAction implements Action {
  readonly type = ProductsActionType.RESET_VIA;
  constructor(public payload: string) {}
}

export class AdjustDisplayRateAction implements Action {
  readonly type = ProductsActionType.ADJUST_DISPLAY_RATE;
  constructor(public payload: string) {}
}

export type ProductsAction =
  | AddAction
  | RemoveAction
  | SetItemAction
  | SetRateAction
  | SetRateTypeAction
  | SetViaAction
  | ResetViaAction
  | AdjustDisplayRateAction;

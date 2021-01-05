import { Action } from '@ngrx/store';

import { RateType, IdPayload } from '~/models';

export const enum ProductsActionType {
  RESET = '[Products] Reset',
  ADD = '[Products] Add',
  REMOVE = '[Products] Remove',
  SET_ITEM = '[Products] Set Item',
  SET_RATE = '[Products] Set Rate',
  SET_RATE_TYPE = '[Products] Set Rate Type',
  SET_VIA = '[Products] Set Via',
}

export class ResetAction implements Action {
  readonly type = ProductsActionType.RESET;
  constructor(public payload: string) {}
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
  constructor(public payload: IdPayload<number>) {}
}

export class SetRateTypeAction implements Action {
  readonly type = ProductsActionType.SET_RATE_TYPE;
  constructor(public payload: IdPayload<RateType>) {}
}

export class SetViaAction implements Action {
  readonly type = ProductsActionType.SET_VIA;
  constructor(public payload: IdPayload) {}
}

export type ProductsAction =
  | ResetAction
  | AddAction
  | RemoveAction
  | SetItemAction
  | SetRateAction
  | SetRateTypeAction
  | SetViaAction;

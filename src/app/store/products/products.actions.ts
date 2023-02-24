import { Action } from '@ngrx/store';

import { IdPayload, Product, RateType } from '~/models';

export const enum ProductsActionType {
  ADD = '[Products] Add',
  CREATE = '[Products] Create',
  REMOVE = '[Products] Remove',
  SET_ITEM = '[Products] Set Item',
  SET_RATE = '[Products] Set Rate',
  SET_RATE_TYPE = '[Products] Set Rate Type',
  ADJUST_DISPLAY_RATE = '[Products] Adjust Display Rate',
}

export class AddAction implements Action {
  readonly type = ProductsActionType.ADD;
  constructor(public payload: string) {}
}

export class CreateAction implements Action {
  readonly type = ProductsActionType.CREATE;
  constructor(public payload: Product) {}
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

export class AdjustDisplayRateAction implements Action {
  readonly type = ProductsActionType.ADJUST_DISPLAY_RATE;
  constructor(public payload: string) {}
}

export type ProductsAction =
  | AddAction
  | CreateAction
  | RemoveAction
  | SetItemAction
  | SetRateAction
  | SetRateTypeAction
  | AdjustDisplayRateAction;

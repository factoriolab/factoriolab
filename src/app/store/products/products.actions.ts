import { Action } from '@ngrx/store';

import { RateType, IdPayload } from '~/models';

export const enum ProductsActionType {
  RESET = '[Products Page] Reset',
  ADD = '[Products Page] Add',
  REMOVE = '[Products Page] Remove',
  EDIT_PRODUCT = '[Products Page] Edit Product',
  EDIT_RATE = '[Products Page] Edit Rate',
  EDIT_RATE_TYPE = '[Products Page] Edit Rate Type',
}

export class ResetAction implements Action {
  readonly type = ProductsActionType.RESET;
  constructor() {}
}

export class AddAction implements Action {
  readonly type = ProductsActionType.ADD;
  constructor(public payload: string) {}
}

export class RemoveAction implements Action {
  readonly type = ProductsActionType.REMOVE;
  constructor(public payload: string) {}
}

export class EditProductAction implements Action {
  readonly type = ProductsActionType.EDIT_PRODUCT;
  constructor(public payload: IdPayload<string>) {}
}

export class EditRateAction implements Action {
  readonly type = ProductsActionType.EDIT_RATE;
  constructor(public payload: IdPayload<number>) {}
}

export class EditRateTypeAction implements Action {
  readonly type = ProductsActionType.EDIT_RATE_TYPE;
  constructor(public payload: IdPayload<RateType>) {}
}

export type ProductsAction =
  | ResetAction
  | AddAction
  | RemoveAction
  | EditProductAction
  | EditRateAction
  | EditRateTypeAction;

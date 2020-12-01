import { Action } from '@ngrx/store';

import { RateType, IdPayload } from '~/models';

export const enum ProductsActionType {
  RESET = '[Products] Reset',
  ADD = '[Products] Add',
  REMOVE = '[Products] Remove',
  EDIT_PRODUCT = '[Products] Edit Product',
  EDIT_RATE = '[Products] Edit Rate',
  EDIT_RATE_TYPE = '[Products] Edit Rate Type',
  EDIT_RECIPE = '[Products] Edit Recipe',
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

export class EditProductAction implements Action {
  readonly type = ProductsActionType.EDIT_PRODUCT;
  constructor(public payload: IdPayload) {}
}

export class EditRateAction implements Action {
  readonly type = ProductsActionType.EDIT_RATE;
  constructor(public payload: IdPayload<number>) {}
}

export class EditRateTypeAction implements Action {
  readonly type = ProductsActionType.EDIT_RATE_TYPE;
  constructor(public payload: IdPayload<RateType>) {}
}

export class EditRecipeAction implements Action {
  readonly type = ProductsActionType.EDIT_RECIPE;
  constructor(public payload: IdPayload) {}
}

export type ProductsAction =
  | ResetAction
  | AddAction
  | RemoveAction
  | EditProductAction
  | EditRateAction
  | EditRateTypeAction
  | EditRecipeAction;

import { Action } from '@ngrx/store';

import { RateType, Product, ItemId } from '~/models';

export const enum ProductsActionType {
  LOAD = '[Products Router] Load',
  ADD = '[Products Page] Add',
  REMOVE = '[Products Page] Remove',
  EDIT_PRODUCT = '[Products Page] Edit Product',
  EDIT_RATE = '[Products Page] Edit Rate',
  EDIT_RATE_TYPE = '[Products Page] Edit Rate Type',
}

export class LoadAction implements Action {
  readonly type = ProductsActionType.LOAD;
  constructor(public payload: Product[]) {}
}

export class AddAction implements Action {
  readonly type = ProductsActionType.ADD;
  constructor(public payload: ItemId) {}
}

export class RemoveAction implements Action {
  readonly type = ProductsActionType.REMOVE;
  constructor(public payload: number) {}
}

export class EditProductAction implements Action {
  readonly type = ProductsActionType.EDIT_PRODUCT;
  constructor(public payload: [number, ItemId]) {}
}

export class EditRateAction implements Action {
  readonly type = ProductsActionType.EDIT_RATE;
  constructor(public payload: [number, number]) {}
}

export class EditRateTypeAction implements Action {
  readonly type = ProductsActionType.EDIT_RATE_TYPE;
  constructor(public payload: [number, RateType]) {}
}

export type ProductsAction =
  | LoadAction
  | AddAction
  | RemoveAction
  | EditProductAction
  | EditRateAction
  | EditRateTypeAction;

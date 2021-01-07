import { Action } from '@ngrx/store';

import { Entities } from '~/models';

export const enum ColumnsActionType {
  SET_COLUMNS = '[Columns] Set Columns',
  SET_PRECISION = '[Columns] Set Precision',
}

export class SetColumnsAction implements Action {
  readonly type = ColumnsActionType.SET_COLUMNS;
  constructor(public payload: string[]) {}
}

export class SetPrecisionAction implements Action {
  readonly type = ColumnsActionType.SET_PRECISION;
  constructor(public payload: Entities<number>) {}
}

export type ColumnsAction = SetColumnsAction | SetPrecisionAction;

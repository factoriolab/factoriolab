import { Action } from '@ngrx/store';

import { IdPayload } from '~/models';

export const enum ColumnsActionType {
  IGNORE = '[Columns] Ignore',
  SET_PRECISION = '[Columns] Set Precision',
}

export class IgnoreAction implements Action {
  readonly type = ColumnsActionType.IGNORE;
  constructor(public payload: string) {}
}

export class SetPrecisionAction implements Action {
  readonly type = ColumnsActionType.SET_PRECISION;
  constructor(public payload: IdPayload<number>) {}
}

export type ColumnsAction = IgnoreAction | SetPrecisionAction;

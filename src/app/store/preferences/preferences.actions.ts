import { Action } from '@ngrx/store';

import { IdPayload, LinkValue, Sort } from '~/models';

export const enum PreferencesActionType {
  SAVE_STATE = '[Preferences] Save State',
  DELETE_STATE = '[Preferences] Delete State',
  SET_SORT = '[Preferences] Set Sort',
  SET_LINK_VALUE = '[Preferences] Set Link Value',
}

export class SaveStateAction implements Action {
  readonly type = PreferencesActionType.SAVE_STATE;
  constructor(public payload: IdPayload) {}
}

export class DeleteStateAction implements Action {
  readonly type = PreferencesActionType.DELETE_STATE;
  constructor(public payload: string) {}
}

export class SetSortAction implements Action {
  readonly type = PreferencesActionType.SET_SORT;
  constructor(public payload: Sort) {}
}

export class SetLinkValueAction implements Action {
  readonly type = PreferencesActionType.SET_LINK_VALUE;
  constructor(public payload: LinkValue) {}
}

export type PreferencesAction =
  | SaveStateAction
  | DeleteStateAction
  | SetSortAction
  | SetLinkValueAction;

import { Action } from '@ngrx/store';

import { IdPayload, LinkValue, Sort, Theme } from '~/models';

export const enum PreferencesActionType {
  SAVE_STATE = '[Preferences] Save State',
  DELETE_STATE = '[Preferences] Delete State',
  SET_SORT = '[Preferences] Set Sort',
  SET_LINK_VALUE = '[Preferences] Set Link Value',
  SET_THEME = '[Preferences] Set Theme',
  SHOW_HEADER = '[Preferences] Show Header',
  HIDE_HEADER = '[Preferences] Hide Header',
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

export class SetThemeAction implements Action {
  readonly type = PreferencesActionType.SET_THEME;
  constructor(public payload: Theme) {}
}

export class ShowHeaderAction implements Action {
  readonly type = PreferencesActionType.SHOW_HEADER;
}

export class HideHeaderAction implements Action {
  readonly type = PreferencesActionType.HIDE_HEADER;
}

export type PreferencesAction =
  | SaveStateAction
  | DeleteStateAction
  | SetSortAction
  | SetLinkValueAction
  | SetThemeAction
  | HideHeaderAction
  | ShowHeaderAction;

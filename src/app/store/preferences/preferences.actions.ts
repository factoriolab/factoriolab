import { Action } from '@ngrx/store';

import { ColumnSettings, Entities, IdPayload, LinkValue } from '~/models';

export const enum PreferencesActionType {
  SAVE_STATE = '[Preferences] Save State',
  REMOVE_STATE = '[Preferences] Remove State',
  SET_COLUMNS = '[Preferences] Set Columns',
  SET_LINK_VALUE = '[Preferences] Set Link Value',
}

export class SaveStateAction implements Action {
  readonly type = PreferencesActionType.SAVE_STATE;
  constructor(public payload: IdPayload) {}
}

export class RemoveStateAction implements Action {
  readonly type = PreferencesActionType.REMOVE_STATE;
  constructor(public payload: string) {}
}

export class SetColumnsAction implements Action {
  readonly type = PreferencesActionType.SET_COLUMNS;
  constructor(public payload: Entities<ColumnSettings>) {}
}

export class SetLinkValueAction implements Action {
  readonly type = PreferencesActionType.SET_LINK_VALUE;
  constructor(public payload: LinkValue) {}
}

export type PreferencesAction =
  | SaveStateAction
  | RemoveStateAction
  | SetColumnsAction
  | SetLinkValueAction;

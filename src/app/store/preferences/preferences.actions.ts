import { Action } from '@ngrx/store';

import {
  ColumnSettings,
  Entities,
  IdPayload,
  LinkValue,
  PowerUnit,
  SankeyAlign,
} from '~/models';

export const enum PreferencesActionType {
  SAVE_STATE = '[Preferences] Save State',
  REMOVE_STATE = '[Preferences] Remove State',
  SET_COLUMNS = '[Preferences] Set Columns',
  SET_LINK_SIZE = '[Preferences] Set Link Size',
  SET_LINK_TEXT = '[Preferences] Set Link Text',
  SET_SANKEY_ALIGN = '[Preferences] Set Sankey Align',
  SET_SIMPLEX = '[Preferences] Set Simplex Enabled',
  SET_LANGUAGE = '[Preferences] Set Display Language',
  SET_POWER_UNIT = '[Preferences] Set Power Unit',
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

export class SetLinkSizeAction implements Action {
  readonly type = PreferencesActionType.SET_LINK_SIZE;
  constructor(public payload: LinkValue) {}
}

export class SetLinkTextAction implements Action {
  readonly type = PreferencesActionType.SET_LINK_TEXT;
  constructor(public payload: LinkValue) {}
}

export class SetSankeyAlignAction implements Action {
  readonly type = PreferencesActionType.SET_SANKEY_ALIGN;
  constructor(public payload: SankeyAlign) {}
}

export class SetSimplexAction implements Action {
  readonly type = PreferencesActionType.SET_SIMPLEX;
  constructor(public payload: boolean) {}
}

export class SetLanguageAction implements Action {
  readonly type = PreferencesActionType.SET_LANGUAGE;
  constructor(public payload: string) {}
}

export class SetPowerUnitAction implements Action {
  readonly type = PreferencesActionType.SET_POWER_UNIT;
  constructor(public payload: PowerUnit) {}
}

export type PreferencesAction =
  | SaveStateAction
  | RemoveStateAction
  | SetColumnsAction
  | SetLinkSizeAction
  | SetLinkTextAction
  | SetSankeyAlignAction
  | SetSimplexAction
  | SetLanguageAction
  | SetPowerUnitAction;

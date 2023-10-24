import { Action } from '@ngrx/store';

import {
  ColumnsState,
  Entities,
  Game,
  KeyIdPayload,
  KeyIdValuePayload,
  Language,
  PowerUnit,
  Theme,
} from '~/models';

export const enum PreferencesActionType {
  SAVE_STATE = '[Preferences] Save State',
  REMOVE_STATE = '[Preferences] Remove State',
  SET_STATES = '[Preferences] Set States',
  SET_COLUMNS = '[Preferences] Set Columns',
  SET_ROWS = '[Preferences] Set Rows',
  SET_DISABLE_PAGINATOR = '[Preferences] Set Disable Paginator',
  SET_LANGUAGE = '[Preferences] Set Display Language',
  SET_POWER_UNIT = '[Preferences] Set Power Unit',
  SET_THEME = '[Preferences] Set Theme',
  SET_BYPASS_LANDING = '[Preferences] Set Bypass Landing',
  SET_SHOW_TECH_LABELS = '[Preferences] Set Show Tech Labels',
  SET_HIDE_DUPLICATE_ICONS = '[Preferences] Set Hide Duplicate Icons',
  SET_PAUSED = '[Preferences] Set Paused',
}

export class SaveStateAction implements Action {
  readonly type = PreferencesActionType.SAVE_STATE;
  constructor(public payload: KeyIdValuePayload<Game>) {}
}

export class RemoveStateAction implements Action {
  readonly type = PreferencesActionType.REMOVE_STATE;
  constructor(public payload: KeyIdPayload<Game>) {}
}

export class SetStatesAction implements Action {
  readonly type = PreferencesActionType.SET_STATES;
  constructor(public payload: Record<Game, Entities<string>>) {}
}

export class SetColumnsAction implements Action {
  readonly type = PreferencesActionType.SET_COLUMNS;
  constructor(public payload: ColumnsState) {}
}

export class SetRowsAction implements Action {
  readonly type = PreferencesActionType.SET_ROWS;
  constructor(public payload: number) {}
}

export class SetDisablePaginatorAction implements Action {
  readonly type = PreferencesActionType.SET_DISABLE_PAGINATOR;
  constructor(public payload: boolean) {}
}

export class SetLanguageAction implements Action {
  readonly type = PreferencesActionType.SET_LANGUAGE;
  constructor(public payload: Language) {}
}

export class SetPowerUnitAction implements Action {
  readonly type = PreferencesActionType.SET_POWER_UNIT;
  constructor(public payload: PowerUnit) {}
}

export class SetThemeAction implements Action {
  readonly type = PreferencesActionType.SET_THEME;
  constructor(public payload: Theme) {}
}

export class SetBypassLandingAction implements Action {
  readonly type = PreferencesActionType.SET_BYPASS_LANDING;
  constructor(public payload: boolean) {}
}

export class SetShowTechLabelsAction implements Action {
  readonly type = PreferencesActionType.SET_SHOW_TECH_LABELS;
  constructor(public payload: boolean) {}
}

export class SetHideDuplicateIconsAction implements Action {
  readonly type = PreferencesActionType.SET_HIDE_DUPLICATE_ICONS;
  constructor(public payload: boolean) {}
}

export class SetPausedAction implements Action {
  readonly type = PreferencesActionType.SET_PAUSED;
  constructor(public payload: boolean) {}
}

export type PreferencesAction =
  | SaveStateAction
  | RemoveStateAction
  | SetStatesAction
  | SetColumnsAction
  | SetRowsAction
  | SetDisablePaginatorAction
  | SetLanguageAction
  | SetPowerUnitAction
  | SetThemeAction
  | SetBypassLandingAction
  | SetShowTechLabelsAction
  | SetHideDuplicateIconsAction
  | SetPausedAction;

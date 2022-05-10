import { Action } from '@ngrx/store';

import { IdPayload, ModData, ModHash, ModI18n } from 'src/app/models';

export const enum DatasetsActionType {
  LOAD_MOD_DATA = '[Datasets] Load Mod Data',
  LOAD_MOD_I18N = '[Datasets] Load Mod I18N',
  LOAD_MOD_HASH = '[Datasets] Load Mod Hash',
}

export class LoadModDataAction implements Action {
  readonly type = DatasetsActionType.LOAD_MOD_DATA;
  constructor(public payload: IdPayload<ModData>) {}
}

export class LoadModI18nAction implements Action {
  readonly type = DatasetsActionType.LOAD_MOD_I18N;
  constructor(public payload: IdPayload<ModI18n>) {}
}

export class LoadModHashAction implements Action {
  readonly type = DatasetsActionType.LOAD_MOD_HASH;
  constructor(public payload: IdPayload<ModHash>) {}
}

export type DatasetsAction =
  | LoadModDataAction
  | LoadModI18nAction
  | LoadModHashAction;

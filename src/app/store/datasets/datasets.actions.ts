import { Action } from '@ngrx/store';

import { IdPayload, ModData, ModHash, ModI18n } from 'src/app/models';

export interface DatasetPayload {
  data: IdPayload<ModData> | null;
  hash: IdPayload<ModHash> | null;
  i18n: IdPayload<ModI18n> | null;
}

export const enum DatasetsActionType {
  LOAD_MOD = '[Datasets] Load Mod',
}

export class LoadModAction implements Action {
  readonly type = DatasetsActionType.LOAD_MOD;
  constructor(public payload: DatasetPayload) {}
}

export type DatasetsAction = LoadModAction;

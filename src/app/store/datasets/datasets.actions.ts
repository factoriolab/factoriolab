import { Action } from '@ngrx/store';

import { IdValuePayload, ModData, ModHash, ModI18n } from 'src/app/models';

export interface DatasetPayload {
  data: IdValuePayload<ModData> | null;
  hash: IdValuePayload<ModHash> | null;
  i18n: IdValuePayload<ModI18n> | null;
}

export const enum DatasetsActionType {
  LOAD_MOD = '[Datasets] Load Mod',
}

export class LoadModAction implements Action {
  readonly type = DatasetsActionType.LOAD_MOD;
  constructor(public payload: DatasetPayload) {}
}

export type DatasetsAction = LoadModAction;

import { Action } from '@ngrx/store';

import { IdPayload, ModData } from 'src/app/models';

export const enum DatasetsActionType {
  LOAD_MOD = '[Dataset Json] Load Mod Data',
}

export class LoadModAction implements Action {
  readonly type = DatasetsActionType.LOAD_MOD;
  constructor(public payload: IdPayload<ModData>) {}
}

export type DatasetsAction = LoadModAction;

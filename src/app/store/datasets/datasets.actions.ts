import { Action } from '@ngrx/store';

import { ModData } from 'src/app/models';

export const enum DatasetsActionType {
  LOAD = '[Dataset Json] Load',
}

export class LoadDataAction implements Action {
  readonly type = DatasetsActionType.LOAD;
  constructor(public payload: ModData[]) {}
}

export type DatasetsAction = LoadDataAction;

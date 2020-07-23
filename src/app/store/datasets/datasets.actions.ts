import { Action } from '@ngrx/store';

import { AppData } from 'src/app/models';

export const enum DatasetsActionType {
  LOAD = '[Dataset Json] Load App Data',
}

export class LoadDataAction implements Action {
  readonly type = DatasetsActionType.LOAD;
  constructor(public payload: AppData) {}
}

export type DatasetsAction = LoadDataAction;

import { Action } from '@ngrx/store';
import { Dataset } from 'src/app/models';

export enum DatasetActionType {
  LOAD = '[Dataset Json] Load'
}

export class LoadDatasetAction implements Action {
  readonly type = DatasetActionType.LOAD;
  constructor(public payload: Dataset) {}
}

export type DatasetAction = LoadDatasetAction;

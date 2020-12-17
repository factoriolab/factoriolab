import { Action } from '@ngrx/store';

import { DefaultIdPayload, IdPayload } from '~/models';

export const enum FactoriesActionType {
  SET_MODULE_RANK = '[Factories] Set Module Rank',
  SET_BEACON_COUNT = '[Factories] Set Beacon Count',
  SET_BEACON = '[Factories] Set Beacon',
  SET_BEACON_MODULE = '[Factories] Set Beacon Module',
}

export class SetModuleRankAction implements Action {
  readonly type = FactoriesActionType.SET_MODULE_RANK;
  constructor(public payload: DefaultIdPayload<string[]>) {}
}

export class SetBeaconCountAction implements Action {
  readonly type = FactoriesActionType.SET_BEACON_COUNT;
  constructor(public payload: DefaultIdPayload<number>) {}
}

export class SetBeaconAction implements Action {
  readonly type = FactoriesActionType.SET_BEACON;
  constructor(public payload: DefaultIdPayload) {}
}

export class SetBeaconModuleAction implements Action {
  readonly type = FactoriesActionType.SET_BEACON_MODULE;
  constructor(public payload: DefaultIdPayload) {}
}

export type FactoriesAction =
  | SetModuleRankAction
  | SetBeaconCountAction
  | SetBeaconAction
  | SetBeaconModuleAction;

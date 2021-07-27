import { Action } from '@ngrx/store';

import { DefaultIdPayload, DefaultPayload } from '~/models';

export const enum FactoriesActionType {
  ADD = '[Factories] Add',
  REMOVE = '[Factories] Remove',
  RAISE = '[Factories] Raise',
  SET_FACTORY = '[Factories] Set Factory',
  SET_MODULE_RANK = '[Factories] Set Module Rank',
  SET_BEACON_COUNT = '[Factories] Set Beacon Count',
  SET_BEACON = '[Factories] Set Beacon',
  SET_BEACON_MODULE = '[Factories] Set Beacon Module',
  SET_OVERCLOCK = '[Factories] Set Overclock',
}

export class AddAction implements Action {
  readonly type = FactoriesActionType.ADD;
  constructor(public payload: DefaultPayload<string, string[]>) {}
}

export class RemoveAction implements Action {
  readonly type = FactoriesActionType.REMOVE;
  constructor(public payload: DefaultPayload<string, string[]>) {}
}

export class RaiseAction implements Action {
  readonly type = FactoriesActionType.RAISE;
  constructor(public payload: DefaultPayload<string, string[]>) {}
}

export class SetFactoryAction implements Action {
  readonly type = FactoriesActionType.SET_FACTORY;
  constructor(public payload: DefaultIdPayload<string, string[]>) {}
}

export class SetModuleRankAction implements Action {
  readonly type = FactoriesActionType.SET_MODULE_RANK;
  constructor(public payload: DefaultIdPayload<string[]>) {}
}

export class SetBeaconCountAction implements Action {
  readonly type = FactoriesActionType.SET_BEACON_COUNT;
  constructor(public payload: DefaultIdPayload<string>) {}
}

export class SetBeaconAction implements Action {
  readonly type = FactoriesActionType.SET_BEACON;
  constructor(public payload: DefaultIdPayload) {}
}

export class SetBeaconModuleAction implements Action {
  readonly type = FactoriesActionType.SET_BEACON_MODULE;
  constructor(public payload: DefaultIdPayload) {}
}

export class SetOverclockAction implements Action {
  readonly type = FactoriesActionType.SET_OVERCLOCK;
  constructor(public payload: DefaultIdPayload<number>) {}
}

export type FactoriesAction =
  | AddAction
  | RemoveAction
  | RaiseAction
  | SetFactoryAction
  | SetModuleRankAction
  | SetBeaconCountAction
  | SetBeaconAction
  | SetBeaconModuleAction
  | SetOverclockAction;

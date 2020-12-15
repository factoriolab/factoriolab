import { Action } from '@ngrx/store';

import { IdPayload } from '~/models';

export const enum FactoriesActionType {
  ADD = '[Factories] Add Override',
  REMOVE = '[Factories] Remove Override',
  SET_FACTORY_MODULES = '[Factories] Set Modules',
  SET_BEACON_COUNT = '[Factories] Set Beacon Count',
  SET_BEACON = '[Factories] Set Beacon',
  SET_BEACON_MODULES = '[Factories] Set Beacon Modules',
}

export class AddAction implements Action {
  readonly type = FactoriesActionType.ADD;
  constructor(public payload: string) {}
}

export class RemoveAction implements Action {
  readonly type = FactoriesActionType.REMOVE;
  constructor(public payload: string) {}
}

export class SetFactoryModulesAction implements Action {
  readonly type = FactoriesActionType.SET_FACTORY_MODULES;
  constructor(public payload: IdPayload<string[]>) {}
}

export class SetBeaconCountAction implements Action {
  readonly type = FactoriesActionType.SET_BEACON_COUNT;
  constructor(public payload: IdPayload<number>) {}
}

export class SetBeaconAction implements Action {
  readonly type = FactoriesActionType.SET_BEACON;
  constructor(public payload: IdPayload) {}
}

export class SetBeaconModulesAction implements Action {
  readonly type = FactoriesActionType.SET_BEACON_MODULES;
  constructor(public payload: IdPayload<string[]>) {}
}

export type FactoriesAction =
  | AddAction
  | RemoveAction
  | SetFactoryModulesAction
  | SetBeaconCountAction
  | SetBeaconAction
  | SetBeaconModulesAction;

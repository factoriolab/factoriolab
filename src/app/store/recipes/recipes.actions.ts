import { Action } from '@ngrx/store';

import { DefaultIdPayload } from '~/models';

export const enum RecipesActionType {
  SET_FACTORY = '[Recipes Page] Set Factory',
  SET_FACTORY_MODULES = '[Recipes Page] Set Modules',
  SET_BEACONS_COUNT = '[Recipes Page] Set Beacon Count',
  SET_BEACON = '[Recipes Page] Set Beacon',
  SET_BEACON_MODULES = '[Recipes Page] Set Beacon Modules',
  RESET = '[Recipes Page] Reset Recipe',
  RESET_FACTORY = '[Recipes Page] Reset Factory',
  RESET_BEACONS = '[Recipes Page] Reset Beacons',
}

export class SetFactoryAction implements Action {
  readonly type = RecipesActionType.SET_FACTORY;
  constructor(public payload: DefaultIdPayload) {}
}

export class SetFactoryModulesAction implements Action {
  readonly type = RecipesActionType.SET_FACTORY_MODULES;
  constructor(public payload: DefaultIdPayload<string[]>) {}
}

export class SetBeaconCountAction implements Action {
  readonly type = RecipesActionType.SET_BEACONS_COUNT;
  constructor(public payload: DefaultIdPayload<number>) {}
}

export class SetBeaconAction implements Action {
  readonly type = RecipesActionType.SET_BEACON;
  constructor(public payload: DefaultIdPayload) {}
}

export class SetBeaconModulesAction implements Action {
  readonly type = RecipesActionType.SET_BEACON_MODULES;
  constructor(public payload: DefaultIdPayload<string[]>) {}
}

export class ResetAction implements Action {
  readonly type = RecipesActionType.RESET;
  constructor(public payload: string) {}
}

export class ResetFactoryAction implements Action {
  readonly type = RecipesActionType.RESET_FACTORY;
}

export class ResetBeaconsAction implements Action {
  readonly type = RecipesActionType.RESET_BEACONS;
}

export type RecipesAction =
  | SetFactoryAction
  | SetFactoryModulesAction
  | SetBeaconCountAction
  | SetBeaconAction
  | SetBeaconModulesAction
  | ResetAction
  | ResetFactoryAction
  | ResetBeaconsAction;

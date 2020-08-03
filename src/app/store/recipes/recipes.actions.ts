import { Action } from '@ngrx/store';

import { IdPayload } from '~/models';

export const enum RecipesActionType {
  SET_FACTORY = '[Recipes Page] Set Factory',
  SET_MODULES = '[Recipes Page] Set Modules',
  SET_BEACON_MODULE = '[Recipes Page] Set Beacon Module',
  SET_BEACONS_COUNT = '[Recipes Page] Set Beacon Count',
  RESET = '[Recipes Page] Reset Recipe',
  RESET_FACTORY = '[Recipes Page] Reset Factory',
  RESET_MODULES = '[Recipes Page] Reset Modules',
  RESET_BEACONS = '[Recipes Page] Reset Beacons',
}

export class SetFactoryAction implements Action {
  readonly type = RecipesActionType.SET_FACTORY;
  constructor(public payload: IdPayload<string>) {}
}

export class SetModulesAction implements Action {
  readonly type = RecipesActionType.SET_MODULES;
  constructor(public payload: IdPayload<string[]>) {}
}

export class SetBeaconModuleAction implements Action {
  readonly type = RecipesActionType.SET_BEACON_MODULE;
  constructor(public payload: IdPayload<string>) {}
}

export class SetBeaconCountAction implements Action {
  readonly type = RecipesActionType.SET_BEACONS_COUNT;
  constructor(public payload: IdPayload<number>) {}
}

export class ResetAction implements Action {
  readonly type = RecipesActionType.RESET;
  constructor(public payload: string) {}
}

export class ResetFactoryAction implements Action {
  readonly type = RecipesActionType.RESET_FACTORY;
}

export class ResetModulesAction implements Action {
  readonly type = RecipesActionType.RESET_MODULES;
}

export class ResetBeaconsAction implements Action {
  readonly type = RecipesActionType.RESET_BEACONS;
}

export type RecipesAction =
  | SetFactoryAction
  | SetModulesAction
  | SetBeaconModuleAction
  | SetBeaconCountAction
  | ResetAction
  | ResetFactoryAction
  | ResetModulesAction
  | ResetBeaconsAction;

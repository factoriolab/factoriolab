import { Action } from '@ngrx/store';

import { RecipeId, ItemId, Rational } from '~/models';
import { RecipeState } from './recipe.reducer';

export const enum RecipeActionType {
  LOAD = '[Recipes Router] Load',
  IGNORE = '[Recipes Page] Ignore Recipe',
  SET_BELT = '[Recipes Page] Set Belt',
  SET_FACTORY = '[Recipes Page] Set Factory',
  SET_MODULES = '[Recipes Page] Set Modules',
  SET_BEACON_MODULE = '[Recipes Page] Set Beacon Module',
  SET_BEACONS_COUNT = '[Recipes Page] Set Beacon Count',
  RESET = '[Recipes Page] Reset Recipe',
  RESET_IGNORE = '[Recipes Page] Reset Ignore',
  RESET_BELT = '[Recipes Page] Reset Belt',
  RESET_FACTORY = '[Recipes Page] Reset Factory',
  RESET_MODULES = '[Recipes Page] Reset Modules',
  RESET_BEACONS = '[Recipes Page] Reset Beacons',
}

export class LoadAction implements Action {
  readonly type = RecipeActionType.LOAD;
  constructor(public payload: RecipeState) {}
}

export class IgnoreAction implements Action {
  readonly type = RecipeActionType.IGNORE;
  constructor(public payload: RecipeId) {}
}

export class SetBeltAction implements Action {
  readonly type = RecipeActionType.SET_BELT;
  constructor(public payload: [RecipeId, ItemId]) {}
}

export class SetFactoryAction implements Action {
  readonly type = RecipeActionType.SET_FACTORY;
  constructor(public payload: [RecipeId, ItemId]) {}
}

export class SetModulesAction implements Action {
  readonly type = RecipeActionType.SET_MODULES;
  constructor(public payload: [RecipeId, ItemId[]]) {}
}

export class SetBeaconModuleAction implements Action {
  readonly type = RecipeActionType.SET_BEACON_MODULE;
  constructor(public payload: [RecipeId, ItemId]) {}
}

export class SetBeaconCountAction implements Action {
  readonly type = RecipeActionType.SET_BEACONS_COUNT;
  constructor(public payload: [RecipeId, number]) {}
}

export class ResetAction implements Action {
  readonly type = RecipeActionType.RESET;
  constructor(public payload: RecipeId) {}
}

export class ResetIgnoreAction implements Action {
  readonly type = RecipeActionType.RESET_IGNORE;
}

export class ResetBeltAction implements Action {
  readonly type = RecipeActionType.RESET_BELT;
}

export class ResetFactoryAction implements Action {
  readonly type = RecipeActionType.RESET_FACTORY;
}

export class ResetModulesAction implements Action {
  readonly type = RecipeActionType.RESET_MODULES;
}

export class ResetBeaconsAction implements Action {
  readonly type = RecipeActionType.RESET_BEACONS;
}

export type RecipeAction =
  | LoadAction
  | IgnoreAction
  | SetBeltAction
  | SetFactoryAction
  | SetModulesAction
  | SetBeaconModuleAction
  | SetBeaconCountAction
  | ResetAction
  | ResetIgnoreAction
  | ResetBeltAction
  | ResetFactoryAction
  | ResetModulesAction
  | ResetBeaconsAction;

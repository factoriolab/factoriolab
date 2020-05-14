import { Action } from '@ngrx/store';

import { RecipeId, ItemId } from '~/models';
import { RecipeState } from './recipe.reducer';

export const enum RecipeActionType {
  LOAD = '[Recipes Router] Load',
  IGNORE = '[Recipes Page] Ignore Recipe',
  RESET = '[Recipes Page] Reset Recipe',
  SET_BELT = '[Recipes Page] Set Belt',
  SET_FACTORY = '[Recipes Page] Set Factory',
  SET_MODULES = '[Recipes Page] Set Modules',
  SET_BEACON_MODULE = '[Recipes Page] Set Beacon Module',
  SET_BEACONS_COUNT = '[Recipes Page] Set Beacon Count',
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

export type RecipeAction =
  | LoadAction
  | IgnoreAction
  | SetBeltAction
  | SetFactoryAction
  | SetModulesAction
  | SetBeaconModuleAction
  | SetBeaconCountAction
  | ResetAction;

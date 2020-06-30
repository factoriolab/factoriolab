import { Action } from '@ngrx/store';

import { RecipeId, ItemId } from '~/models';
import { RecipesState } from './recipes.reducer';

export const enum RecipesActionType {
  LOAD = '[Recipes Router] Load',
  SET_FACTORY = '[Recipes Page] Set Factory',
  SET_MODULES = '[Recipes Page] Set Modules',
  SET_BEACON_MODULE = '[Recipes Page] Set Beacon Module',
  SET_BEACONS_COUNT = '[Recipes Page] Set Beacon Count',
  RESET = '[Recipes Page] Reset Recipe',
  RESET_FACTORY = '[Recipes Page] Reset Factory',
  RESET_MODULES = '[Recipes Page] Reset Modules',
  RESET_BEACONS = '[Recipes Page] Reset Beacons',
}

export class LoadAction implements Action {
  readonly type = RecipesActionType.LOAD;
  constructor(public payload: RecipesState) {}
}

export class SetFactoryAction implements Action {
  readonly type = RecipesActionType.SET_FACTORY;
  constructor(public payload: [RecipeId, ItemId]) {}
}

export class SetModulesAction implements Action {
  readonly type = RecipesActionType.SET_MODULES;
  constructor(public payload: [RecipeId, ItemId[]]) {}
}

export class SetBeaconModuleAction implements Action {
  readonly type = RecipesActionType.SET_BEACON_MODULE;
  constructor(public payload: [RecipeId, ItemId]) {}
}

export class SetBeaconCountAction implements Action {
  readonly type = RecipesActionType.SET_BEACONS_COUNT;
  constructor(public payload: [RecipeId, number]) {}
}

export class ResetAction implements Action {
  readonly type = RecipesActionType.RESET;
  constructor(public payload: RecipeId) {}
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
  | LoadAction
  | SetFactoryAction
  | SetModulesAction
  | SetBeaconModuleAction
  | SetBeaconCountAction
  | ResetAction
  | ResetFactoryAction
  | ResetModulesAction
  | ResetBeaconsAction;

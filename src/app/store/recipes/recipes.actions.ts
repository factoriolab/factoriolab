import { Action } from '@ngrx/store';

import { DefaultIdPayload, IdPayload } from '~/models';

export const enum RecipesActionType {
  SET_FACTORY = '[Recipes] Set Factory',
  SET_FACTORY_MODULES = '[Recipes] Set Modules',
  SET_BEACON_COUNT = '[Recipes] Set Beacon Count',
  SET_BEACON = '[Recipes] Set Beacon',
  SET_BEACON_MODULES = '[Recipes] Set Beacon Modules',
  SET_BEACON_TOTAL = '[Recipes] Set Beacon Total',
  SET_OVERCLOCK = '[Recipes] Set Overclock',
  SET_COST = '[Recipes] Set Cost',
  RESET_RECIPE = '[Recipes] Reset Recipe',
  RESET_RECIPE_MODULES = '[Recipes] Reset Recipe Modules',
  RESET_FACTORY = '[Recipes] Reset Factory',
  RESET_BEACONS = '[Recipes] Reset Beacons',
  RESET_OVERCLOCK = '[Recipes] Reset Overclock',
  RESET_COST = '[Recipes] Reset Cost',
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
  readonly type = RecipesActionType.SET_BEACON_COUNT;
  constructor(public payload: DefaultIdPayload) {}
}

export class SetBeaconAction implements Action {
  readonly type = RecipesActionType.SET_BEACON;
  constructor(public payload: DefaultIdPayload) {}
}

export class SetBeaconModulesAction implements Action {
  readonly type = RecipesActionType.SET_BEACON_MODULES;
  constructor(public payload: DefaultIdPayload<string[]>) {}
}

export class SetBeaconTotalAction implements Action {
  readonly type = RecipesActionType.SET_BEACON_TOTAL;
  constructor(public payload: IdPayload) {}
}

export class SetOverclockAction implements Action {
  readonly type = RecipesActionType.SET_OVERCLOCK;
  constructor(public payload: DefaultIdPayload<number>) {}
}

export class SetCostAction implements Action {
  readonly type = RecipesActionType.SET_COST;
  constructor(public payload: IdPayload<string | undefined>) {}
}

export class ResetRecipeAction implements Action {
  readonly type = RecipesActionType.RESET_RECIPE;
  constructor(public payload: string) {}
}

export class ResetRecipeModulesAction implements Action {
  readonly type = RecipesActionType.RESET_RECIPE_MODULES;
  constructor(public payload: string) {}
}

export class ResetFactoryAction implements Action {
  readonly type = RecipesActionType.RESET_FACTORY;
}

export class ResetBeaconsAction implements Action {
  readonly type = RecipesActionType.RESET_BEACONS;
}

export class ResetOverclockAction implements Action {
  readonly type = RecipesActionType.RESET_OVERCLOCK;
}

export class ResetCostAction implements Action {
  readonly type = RecipesActionType.RESET_COST;
}

export type RecipesAction =
  | SetFactoryAction
  | SetFactoryModulesAction
  | SetBeaconCountAction
  | SetBeaconAction
  | SetBeaconModulesAction
  | SetBeaconTotalAction
  | SetOverclockAction
  | SetCostAction
  | ResetRecipeAction
  | ResetRecipeModulesAction
  | ResetFactoryAction
  | ResetBeaconsAction
  | ResetOverclockAction
  | ResetCostAction;

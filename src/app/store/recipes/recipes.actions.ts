import { Action } from '@ngrx/store';

import {
  IdIndexValueDefaultPayload,
  IdIndexValuePayload,
  IdValueDefaultPayload,
  IdValuePayload,
} from '~/models';

export const enum RecipesActionType {
  SET_EXCLUDED = '[Recipes] Set Excluded',
  SET_EXCLUDED_BATCH = '[Recipes] Set Excluded Batch',
  SET_CHECKED = '[Recipes] Set Checked',
  SET_MACHINE = '[Recipes] Set Machine',
  SET_FUEL = '[Recipes] Set Fuel',
  SET_MACHINE_MODULES = '[Recipes] Set Machine Modules',
  ADD_BEACON = '[Recipes] Add Beacon',
  REMOVE_BEACON = '[Recipes] Remove Beacon',
  SET_BEACON_COUNT = '[Recipes] Set Beacon Count',
  SET_BEACON = '[Recipes] Set Beacon',
  SET_BEACON_MODULES = '[Recipes] Set Beacon Modules',
  SET_BEACON_TOTAL = '[Recipes] Set Beacon Total',
  SET_OVERCLOCK = '[Recipes] Set Overclock',
  SET_COST = '[Recipes] Set Cost',
  RESET_RECIPE = '[Recipes] Reset Recipe',
  RESET_EXCLUDED = '[Recipes] Reset Excluded',
  RESET_RECIPE_FUEL = '[Recipes] Reset Fuel',
  RESET_RECIPE_MODULES = '[Recipes] Reset Recipe Modules',
  RESET_MACHINES = '[Recipes] Reset Machines',
  RESET_BEACONS = '[Recipes] Reset Beacons',
  RESET_COST = '[Recipes] Reset Cost',
}

export class SetExcludedAction implements Action {
  readonly type = RecipesActionType.SET_EXCLUDED;
  constructor(public payload: IdValueDefaultPayload<boolean>) {}
}

export class SetExcludedBatchAction implements Action {
  readonly type = RecipesActionType.SET_EXCLUDED_BATCH;
  constructor(public payload: IdValueDefaultPayload<boolean>[]) {}
}

export class SetCheckedAction implements Action {
  readonly type = RecipesActionType.SET_CHECKED;
  constructor(public payload: IdValuePayload<boolean>) {}
}

export class SetMachineAction implements Action {
  readonly type = RecipesActionType.SET_MACHINE;
  constructor(public payload: IdValueDefaultPayload) {}
}

export class SetFuelAction implements Action {
  readonly type = RecipesActionType.SET_FUEL;
  constructor(public payload: IdValueDefaultPayload) {}
}

export class SetMachineModulesAction implements Action {
  readonly type = RecipesActionType.SET_MACHINE_MODULES;
  constructor(public payload: IdValueDefaultPayload<string[]>) {}
}

export class AddBeaconAction implements Action {
  readonly type = RecipesActionType.ADD_BEACON;
  constructor(public payload: string) {}
}

export class RemoveBeaconAction implements Action {
  readonly type = RecipesActionType.REMOVE_BEACON;
  constructor(public payload: IdValuePayload<number>) {}
}

export class SetBeaconCountAction implements Action {
  readonly type = RecipesActionType.SET_BEACON_COUNT;
  constructor(public payload: IdIndexValueDefaultPayload) {}
}

export class SetBeaconAction implements Action {
  readonly type = RecipesActionType.SET_BEACON;
  constructor(public payload: IdIndexValueDefaultPayload) {}
}

export class SetBeaconModulesAction implements Action {
  readonly type = RecipesActionType.SET_BEACON_MODULES;
  constructor(public payload: IdIndexValueDefaultPayload<string[]>) {}
}

export class SetBeaconTotalAction implements Action {
  readonly type = RecipesActionType.SET_BEACON_TOTAL;
  constructor(public payload: IdIndexValuePayload) {}
}

export class SetOverclockAction implements Action {
  readonly type = RecipesActionType.SET_OVERCLOCK;
  constructor(public payload: IdValueDefaultPayload<number>) {}
}

export class SetCostAction implements Action {
  readonly type = RecipesActionType.SET_COST;
  constructor(public payload: IdValuePayload<string | undefined>) {}
}

export class ResetRecipeAction implements Action {
  readonly type = RecipesActionType.RESET_RECIPE;
  constructor(public payload: string) {}
}

export class ResetRecipeFuelAction implements Action {
  readonly type = RecipesActionType.RESET_RECIPE_FUEL;
  constructor(public payload: string) {}
}

export class ResetRecipeModulesAction implements Action {
  readonly type = RecipesActionType.RESET_RECIPE_MODULES;
  constructor(public payload: string) {}
}

export class ResetExcludedAction implements Action {
  readonly type = RecipesActionType.RESET_EXCLUDED;
}

export class ResetMachinesAction implements Action {
  readonly type = RecipesActionType.RESET_MACHINES;
}

export class ResetBeaconsAction implements Action {
  readonly type = RecipesActionType.RESET_BEACONS;
}

export class ResetCostAction implements Action {
  readonly type = RecipesActionType.RESET_COST;
}

export type RecipesAction =
  | SetExcludedAction
  | SetExcludedBatchAction
  | SetCheckedAction
  | SetMachineAction
  | SetFuelAction
  | SetMachineModulesAction
  | AddBeaconAction
  | RemoveBeaconAction
  | SetBeaconCountAction
  | SetBeaconAction
  | SetBeaconModulesAction
  | SetBeaconTotalAction
  | SetOverclockAction
  | SetCostAction
  | ResetRecipeAction
  | ResetRecipeFuelAction
  | ResetRecipeModulesAction
  | ResetExcludedAction
  | ResetMachinesAction
  | ResetBeaconsAction
  | ResetCostAction;

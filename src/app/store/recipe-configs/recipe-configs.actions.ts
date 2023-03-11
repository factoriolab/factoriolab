import { Action } from '@ngrx/store';

import {
  IdDefaultPayload,
  IdIndexDefaultPayload,
  IdIndexPayload,
  IdPayload,
} from '~/models';

export const enum RecipesCfgActionType {
  SET_EXCLUDED = '[Recipe Configs] Set Excluded',
  SET_EXCLUDED_BATCH = '[Recipe Configs] Set Excluded Batch',
  SET_CHECKED = '[Recipe Configs] Set Checked',
  SET_MACHINE = '[Recipe Configs] Set Machine',
  SET_MACHINE_MODULES = '[Recipe Configs] Set Machine Modules',
  ADD_BEACON = '[Recipe Configs] Add Beacon',
  REMOVE_BEACON = '[Recipe Configs] Remove Beacon',
  SET_BEACON_COUNT = '[Recipe Configs] Set Beacon Count',
  SET_BEACON = '[Recipe Configs] Set Beacon',
  SET_BEACON_MODULES = '[Recipe Configs] Set Beacon Modules',
  SET_BEACON_TOTAL = '[Recipe Configs] Set Beacon Total',
  SET_OVERCLOCK = '[Recipe Configs] Set Overclock',
  SET_COST = '[Recipe Configs] Set Cost',
  RESET_RECIPE = '[Recipe Configs] Reset Recipe',
  RESET_EXCLUDED = '[Recipe Configs] Reset Excluded',
  RESET_RECIPE_MODULES = '[Recipe Configs] Reset Recipe Modules',
  RESET_MACHINES = '[Recipe Configs] Reset Machines',
  RESET_BEACONS = '[Recipe Configs] Reset Beacons',
  RESET_COST = '[Recipe Configs] Reset Cost',
}

export class SetExcludedAction implements Action {
  readonly type = RecipesCfgActionType.SET_EXCLUDED;
  constructor(public payload: IdDefaultPayload<boolean>) {}
}

export class SetExcludedBatchAction implements Action {
  readonly type = RecipesCfgActionType.SET_EXCLUDED_BATCH;
  constructor(public payload: IdDefaultPayload<boolean>[]) {}
}

export class SetCheckedAction implements Action {
  readonly type = RecipesCfgActionType.SET_CHECKED;
  constructor(public payload: IdPayload<boolean>) {}
}

export class SetMachineAction implements Action {
  readonly type = RecipesCfgActionType.SET_MACHINE;
  constructor(public payload: IdDefaultPayload) {}
}

export class SetMachineModulesAction implements Action {
  readonly type = RecipesCfgActionType.SET_MACHINE_MODULES;
  constructor(public payload: IdDefaultPayload<string[]>) {}
}

export class AddBeaconAction implements Action {
  readonly type = RecipesCfgActionType.ADD_BEACON;
  constructor(public payload: string) {}
}

export class RemoveBeaconAction implements Action {
  readonly type = RecipesCfgActionType.REMOVE_BEACON;
  constructor(public payload: IdPayload<number>) {}
}

export class SetBeaconCountAction implements Action {
  readonly type = RecipesCfgActionType.SET_BEACON_COUNT;
  constructor(public payload: IdIndexDefaultPayload) {}
}

export class SetBeaconAction implements Action {
  readonly type = RecipesCfgActionType.SET_BEACON;
  constructor(public payload: IdIndexDefaultPayload) {}
}

export class SetBeaconModulesAction implements Action {
  readonly type = RecipesCfgActionType.SET_BEACON_MODULES;
  constructor(public payload: IdIndexDefaultPayload<string[]>) {}
}

export class SetBeaconTotalAction implements Action {
  readonly type = RecipesCfgActionType.SET_BEACON_TOTAL;
  constructor(public payload: IdIndexPayload) {}
}

export class SetOverclockAction implements Action {
  readonly type = RecipesCfgActionType.SET_OVERCLOCK;
  constructor(public payload: IdDefaultPayload<number>) {}
}

export class SetCostAction implements Action {
  readonly type = RecipesCfgActionType.SET_COST;
  constructor(public payload: IdPayload<string | undefined>) {}
}

export class ResetRecipeAction implements Action {
  readonly type = RecipesCfgActionType.RESET_RECIPE;
  constructor(public payload: string) {}
}

export class ResetRecipeModulesAction implements Action {
  readonly type = RecipesCfgActionType.RESET_RECIPE_MODULES;
  constructor(public payload: string) {}
}

export class ResetExcludedAction implements Action {
  readonly type = RecipesCfgActionType.RESET_EXCLUDED;
}

export class ResetMachinesAction implements Action {
  readonly type = RecipesCfgActionType.RESET_MACHINES;
}

export class ResetBeaconsAction implements Action {
  readonly type = RecipesCfgActionType.RESET_BEACONS;
}

export class ResetCostAction implements Action {
  readonly type = RecipesCfgActionType.RESET_COST;
}

export type RecipesCfgAction =
  | SetExcludedAction
  | SetExcludedBatchAction
  | SetCheckedAction
  | SetMachineAction
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
  | ResetRecipeModulesAction
  | ResetExcludedAction
  | ResetMachinesAction
  | ResetBeaconsAction
  | ResetCostAction;

import { Action } from '@ngrx/store';

import {
  IdDefaultPayload,
  IdIndexDefaultPayload,
  IdIndexPayload,
  IdPayload,
  ObjectiveType,
} from '~/models';
import { RecipeObjective } from '~/models/recipe-objective';

export const enum RecipeObjectivesActionType {
  ADD = '[Recipe Objectives] Add',
  CREATE = '[Recipe Objectives] Create',
  REMOVE = '[Recipe Objectives] Remove',
  SET_RECIPE = '[Recipe Objectives] Set Recipe',
  SET_COUNT = '[Recipe Objectives] Set Count',
  SET_TYPE = '[Recipe Objectives] Set Type',
  SET_MACHINE = '[Recipe Objectives] Set Machine',
  SET_MACHINE_MODULES = '[Recipe Objectives] Set Machine Modules',
  ADD_BEACON = '[Recipe Objectives] Add Beacon',
  REMOVE_BEACON = '[Recipe Objectives] Remove Beacon',
  SET_BEACON_COUNT = '[Recipe Objectives] Set Beacon Count',
  SET_BEACON = '[Recipe Objectives] Set Beacon',
  SET_BEACON_MODULES = '[Recipe Objectives] Set Beacon Modules',
  SET_BEACON_TOTAL = '[Recipes] Set Beacon Total',
  SET_OVERCLOCK = '[Recipe Objectives] Set Overclock',
  SET_CHECKED = '[Recipe Objectives] Set Checked',
  RESET_OBJECTIVE = '[Recipe Objectives] Reset Objective',
}

export class AddAction implements Action {
  readonly type = RecipeObjectivesActionType.ADD;
  constructor(public payload: string) {}
}

export class CreateAction implements Action {
  readonly type = RecipeObjectivesActionType.CREATE;
  constructor(public payload: RecipeObjective) {}
}

export class RemoveAction implements Action {
  readonly type = RecipeObjectivesActionType.REMOVE;
  constructor(public payload: string) {}
}

export class SetRecipeAction implements Action {
  readonly type = RecipeObjectivesActionType.SET_RECIPE;
  constructor(public payload: IdPayload) {}
}

export class SetCountAction implements Action {
  readonly type = RecipeObjectivesActionType.SET_COUNT;
  constructor(public payload: IdPayload<string>) {}
}

export class SetTypeAction implements Action {
  readonly type = RecipeObjectivesActionType.SET_TYPE;
  constructor(public payload: IdPayload<ObjectiveType>) {}
}

export class SetMachineAction implements Action {
  readonly type = RecipeObjectivesActionType.SET_MACHINE;
  constructor(public payload: IdDefaultPayload) {}
}

export class SetMachineModulesAction implements Action {
  readonly type = RecipeObjectivesActionType.SET_MACHINE_MODULES;
  constructor(public payload: IdDefaultPayload<string[]>) {}
}

export class AddBeaconAction implements Action {
  readonly type = RecipeObjectivesActionType.ADD_BEACON;
  constructor(public payload: string) {}
}

export class RemoveBeaconAction implements Action {
  readonly type = RecipeObjectivesActionType.REMOVE_BEACON;
  constructor(public payload: IdPayload<number>) {}
}

export class SetBeaconCountAction implements Action {
  readonly type = RecipeObjectivesActionType.SET_BEACON_COUNT;
  constructor(public payload: IdIndexDefaultPayload) {}
}

export class SetBeaconAction implements Action {
  readonly type = RecipeObjectivesActionType.SET_BEACON;
  constructor(public payload: IdIndexDefaultPayload) {}
}

export class SetBeaconModulesAction implements Action {
  readonly type = RecipeObjectivesActionType.SET_BEACON_MODULES;
  constructor(public payload: IdIndexDefaultPayload<string[]>) {}
}

export class SetBeaconTotalAction implements Action {
  readonly type = RecipeObjectivesActionType.SET_BEACON_TOTAL;
  constructor(public payload: IdIndexPayload) {}
}

export class SetOverclockAction implements Action {
  readonly type = RecipeObjectivesActionType.SET_OVERCLOCK;
  constructor(public payload: IdDefaultPayload<number>) {}
}

export class SetCheckedAction implements Action {
  readonly type = RecipeObjectivesActionType.SET_CHECKED;
  constructor(public payload: IdPayload<boolean>) {}
}

export class ResetObjectiveAction implements Action {
  readonly type = RecipeObjectivesActionType.RESET_OBJECTIVE;
  constructor(public payload: string) {}
}

export type RecipeObjectivesAction =
  | AddAction
  | CreateAction
  | RemoveAction
  | SetRecipeAction
  | SetCountAction
  | SetTypeAction
  | SetMachineAction
  | SetMachineModulesAction
  | AddBeaconAction
  | RemoveBeaconAction
  | SetBeaconCountAction
  | SetBeaconAction
  | SetBeaconModulesAction
  | SetBeaconTotalAction
  | SetOverclockAction
  | SetCheckedAction
  | ResetObjectiveAction;

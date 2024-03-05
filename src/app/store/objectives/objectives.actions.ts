import { Action } from '@ngrx/store';

import {
  IdIndexValueDefaultPayload,
  IdIndexValuePayload,
  IdValueDefaultPayload,
  IdValuePayload,
  Objective,
  ObjectiveBase,
  ObjectiveType,
} from '~/models';

export const enum ObjectivesActionType {
  ADD = '[Objectives] Add',
  CREATE = '[Objectives] Create',
  REMOVE = '[Objectives] Remove',
  SET_ORDER = '[Objectives] Set Order',
  SET_TARGET = '[Objectives] Set Target',
  SET_VALUE = '[Objectives] Set Value',
  SET_UNIT = '[Objectives] Set Unit',
  SET_TYPE = '[Objectives] Set Type',
  SET_MACHINE = '[Objectives] Set Machine',
  SET_FUEL = '[Objectives] Set Fuel',
  SET_MACHINE_MODULES = '[Objectives] Set Machine Modules',
  ADD_BEACON = '[Objectives] Add Beacon',
  REMOVE_BEACON = '[Objectives] Remove Beacon',
  SET_BEACON_COUNT = '[Objectives] Set Beacon Count',
  SET_BEACON = '[Objectives] Set Beacon',
  SET_BEACON_MODULES = '[Objectives] Set Beacon Modules',
  SET_BEACON_TOTAL = '[Recipes] Set Beacon Total',
  SET_OVERCLOCK = '[Objectives] Set Overclock',
  SET_CHECKED = '[Objectives] Set Checked',
  RESET_OBJECTIVE = '[Objectives] Reset Objective',
  ADJUST_DISPLAY_RATE = '[Objectives] Adjust Display Rate',
}

export class AddAction implements Action {
  readonly type = ObjectivesActionType.ADD;
  constructor(public payload: ObjectiveBase) {}
}

export class CreateAction implements Action {
  readonly type = ObjectivesActionType.CREATE;
  constructor(public payload: Objective) {}
}

export class RemoveAction implements Action {
  readonly type = ObjectivesActionType.REMOVE;
  constructor(public payload: string) {}
}

export class SetOrderAction implements Action {
  readonly type = ObjectivesActionType.SET_ORDER;
  constructor(public payload: string[]) {}
}

export class SetTargetAction implements Action {
  readonly type = ObjectivesActionType.SET_TARGET;
  constructor(public payload: IdValuePayload) {}
}

export class SetValueAction implements Action {
  readonly type = ObjectivesActionType.SET_VALUE;
  constructor(public payload: IdValuePayload<string>) {}
}

export class SetUnitAction implements Action {
  readonly type = ObjectivesActionType.SET_UNIT;
  constructor(public payload: IdValuePayload<ObjectiveBase>) {}
}

export class SetTypeAction implements Action {
  readonly type = ObjectivesActionType.SET_TYPE;
  constructor(public payload: IdValuePayload<ObjectiveType>) {}
}

export class SetMachineAction implements Action {
  readonly type = ObjectivesActionType.SET_MACHINE;
  constructor(public payload: IdValueDefaultPayload) {}
}

export class SetFuelAction implements Action {
  readonly type = ObjectivesActionType.SET_FUEL;
  constructor(public payload: IdValueDefaultPayload) {}
}

export class SetMachineModulesAction implements Action {
  readonly type = ObjectivesActionType.SET_MACHINE_MODULES;
  constructor(public payload: IdValueDefaultPayload<string[]>) {}
}

export class AddBeaconAction implements Action {
  readonly type = ObjectivesActionType.ADD_BEACON;
  constructor(public payload: string) {}
}

export class RemoveBeaconAction implements Action {
  readonly type = ObjectivesActionType.REMOVE_BEACON;
  constructor(public payload: IdValuePayload<number>) {}
}

export class SetBeaconCountAction implements Action {
  readonly type = ObjectivesActionType.SET_BEACON_COUNT;
  constructor(public payload: IdIndexValueDefaultPayload) {}
}

export class SetBeaconAction implements Action {
  readonly type = ObjectivesActionType.SET_BEACON;
  constructor(public payload: IdIndexValueDefaultPayload) {}
}

export class SetBeaconModulesAction implements Action {
  readonly type = ObjectivesActionType.SET_BEACON_MODULES;
  constructor(public payload: IdIndexValueDefaultPayload<string[]>) {}
}

export class SetBeaconTotalAction implements Action {
  readonly type = ObjectivesActionType.SET_BEACON_TOTAL;
  constructor(public payload: IdIndexValuePayload) {}
}

export class SetOverclockAction implements Action {
  readonly type = ObjectivesActionType.SET_OVERCLOCK;
  constructor(public payload: IdValueDefaultPayload<number>) {}
}

export class SetCheckedAction implements Action {
  readonly type = ObjectivesActionType.SET_CHECKED;
  constructor(public payload: IdValuePayload<boolean>) {}
}

export class ResetObjectiveAction implements Action {
  readonly type = ObjectivesActionType.RESET_OBJECTIVE;
  constructor(public payload: string) {}
}

export class AdjustDisplayRateAction implements Action {
  readonly type = ObjectivesActionType.ADJUST_DISPLAY_RATE;
  constructor(public payload: string) {}
}

export type ObjectivesAction =
  | AddAction
  | CreateAction
  | RemoveAction
  | SetOrderAction
  | SetTargetAction
  | SetValueAction
  | SetUnitAction
  | SetTypeAction
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
  | SetCheckedAction
  | ResetObjectiveAction
  | AdjustDisplayRateAction;

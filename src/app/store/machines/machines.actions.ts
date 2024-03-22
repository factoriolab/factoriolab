import { Action } from '@ngrx/store';

import {
  BeaconSettings,
  IdValueDefaultPayload,
  IdValuePayload,
  ModuleSettings,
  Rational,
  ValueDefaultPayload,
} from '~/models';

export const enum MachinesActionType {
  SET_FUEL_RANK = '[Machines] Set Fuel Rank',
  SET_MODULE_RANK = '[Machines] Set Module Rank',
  SET_DEFAULT_BEACONS = '[Machines] Set Default Beacons',
  SET_DEFAULT_OVERCLOCK = '[Machines] Set Default Overclock',
  ADD = '[Machines] Add',
  REMOVE = '[Machines] Remove',
  SET_RANK = '[Machines] Set Rank',
  SET_MACHINE = '[Machines] Set Machine',
  SET_FUEL = '[Machines] Set Fuel',
  SET_MODULES = '[Machines] Set Modules',
  SET_BEACONS = '[Machines] Set Beacons',
  SET_OVERCLOCK = '[Machines] Set Overclock',
  RESET_MACHINE = '[Machines] Reset Machine',
}

export class SetFuelRankAction implements Action {
  readonly type = MachinesActionType.SET_FUEL_RANK;
  constructor(public payload: ValueDefaultPayload<string[]>) {}
}

export class SetModuleRankAction implements Action {
  readonly type = MachinesActionType.SET_MODULE_RANK;
  constructor(public payload: ValueDefaultPayload<string[]>) {}
}

export class SetDefaultBeaconsAction implements Action {
  readonly type = MachinesActionType.SET_DEFAULT_BEACONS;
  constructor(public payload: BeaconSettings[] | undefined) {}
}

export class SetDefaultOverclockAction implements Action {
  readonly type = MachinesActionType.SET_DEFAULT_OVERCLOCK;
  constructor(public payload: Rational | undefined) {}
}

export class AddAction implements Action {
  readonly type = MachinesActionType.ADD;
  constructor(public payload: ValueDefaultPayload<string, string[]>) {}
}

export class RemoveAction implements Action {
  readonly type = MachinesActionType.REMOVE;
  constructor(public payload: ValueDefaultPayload<string, string[]>) {}
}

export class SetRankAction implements Action {
  readonly type = MachinesActionType.SET_RANK;
  constructor(public payload: ValueDefaultPayload<string[]>) {}
}

export class SetMachineAction implements Action {
  readonly type = MachinesActionType.SET_MACHINE;
  constructor(public payload: IdValueDefaultPayload<string, string[]>) {}
}

export class SetFuelAction implements Action {
  readonly type = MachinesActionType.SET_FUEL;
  constructor(public payload: IdValueDefaultPayload<string>) {}
}

export class SetModulesAction implements Action {
  readonly type = MachinesActionType.SET_MODULES;
  constructor(public payload: IdValuePayload<ModuleSettings[]>) {}
}

export class SetBeaconsAction implements Action {
  readonly type = MachinesActionType.SET_BEACONS;
  constructor(public payload: IdValuePayload<BeaconSettings[]>) {}
}

export class SetOverclockAction implements Action {
  readonly type = MachinesActionType.SET_OVERCLOCK;
  constructor(public payload: IdValueDefaultPayload<Rational>) {}
}

export class ResetMachineAction implements Action {
  readonly type = MachinesActionType.RESET_MACHINE;
  constructor(public payload: string) {}
}

export type MachinesAction =
  | SetFuelRankAction
  | SetModuleRankAction
  | SetDefaultBeaconsAction
  | SetDefaultOverclockAction
  | AddAction
  | RemoveAction
  | SetRankAction
  | SetMachineAction
  | SetFuelAction
  | SetModulesAction
  | SetBeaconsAction
  | SetOverclockAction
  | ResetMachineAction;

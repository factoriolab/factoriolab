import { Action } from '@ngrx/store';

import { IdValueDefaultPayload, ValueDefaultPayload } from '~/models';

export const enum MachinesActionType {
  ADD = '[Machines] Add',
  REMOVE = '[Machines] Remove',
  SET_RANK = '[Machines] Set Rank',
  SET_MACHINE = '[Machines] Set Machine',
  SET_FUEL = '[Machines] Set Fuel',
  SET_MODULE_RANK = '[Machines] Set Module Rank',
  SET_BEACON_COUNT = '[Machines] Set Beacon Count',
  SET_BEACON = '[Machines] Set Beacon',
  SET_BEACON_MODULE_RANK = '[Machines] Set Beacon Module Rank',
  SET_OVERCLOCK = '[Machines] Set Overclock',
  RESET_MACHINE = '[Machines] Reset Machine',
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

export class SetModuleRankAction implements Action {
  readonly type = MachinesActionType.SET_MODULE_RANK;
  constructor(public payload: IdValueDefaultPayload<string[]>) {}
}

export class SetBeaconCountAction implements Action {
  readonly type = MachinesActionType.SET_BEACON_COUNT;
  constructor(public payload: IdValueDefaultPayload<string>) {}
}

export class SetBeaconAction implements Action {
  readonly type = MachinesActionType.SET_BEACON;
  constructor(public payload: IdValueDefaultPayload) {}
}

export class SetBeaconModuleRankAction implements Action {
  readonly type = MachinesActionType.SET_BEACON_MODULE_RANK;
  constructor(public payload: IdValueDefaultPayload<string[]>) {}
}

export class SetOverclockAction implements Action {
  readonly type = MachinesActionType.SET_OVERCLOCK;
  constructor(public payload: IdValueDefaultPayload<number>) {}
}

export class ResetMachineAction implements Action {
  readonly type = MachinesActionType.RESET_MACHINE;
  constructor(public payload: string) {}
}

export type MachinesAction =
  | AddAction
  | RemoveAction
  | SetRankAction
  | SetMachineAction
  | SetFuelAction
  | SetModuleRankAction
  | SetBeaconCountAction
  | SetBeaconAction
  | SetBeaconModuleRankAction
  | SetOverclockAction
  | ResetMachineAction;

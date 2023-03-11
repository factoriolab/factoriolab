import { Action } from '@ngrx/store';

import { DefaultPayload, IdDefaultPayload } from '~/models';

export const enum MachinesCfgActionType {
  ADD = '[Machine Configs] Add',
  REMOVE = '[Machine Configs] Remove',
  RAISE = '[Machine Configs] Raise',
  LOWER = '[Machine Configs] Lower',
  SET_MACHINE = '[Machine Configs] Set Machine',
  SET_MODULE_RANK = '[Machine Configs] Set Module Rank',
  SET_BEACON_COUNT = '[Machine Configs] Set Beacon Count',
  SET_BEACON = '[Machine Configs] Set Beacon',
  SET_BEACON_MODULE_RANK = '[Machine Configs] Set Beacon Module Rank',
  SET_OVERCLOCK = '[Machine Configs] Set Overclock',
}

export class AddAction implements Action {
  readonly type = MachinesCfgActionType.ADD;
  constructor(public payload: DefaultPayload<string, string[]>) {}
}

export class RemoveAction implements Action {
  readonly type = MachinesCfgActionType.REMOVE;
  constructor(public payload: DefaultPayload<string, string[]>) {}
}

export class RaiseAction implements Action {
  readonly type = MachinesCfgActionType.RAISE;
  constructor(public payload: DefaultPayload<string, string[]>) {}
}

export class LowerAction implements Action {
  readonly type = MachinesCfgActionType.LOWER;
  constructor(public payload: DefaultPayload<string, string[]>) {}
}

export class SetMachineAction implements Action {
  readonly type = MachinesCfgActionType.SET_MACHINE;
  constructor(public payload: IdDefaultPayload<string, string[]>) {}
}

export class SetModuleRankAction implements Action {
  readonly type = MachinesCfgActionType.SET_MODULE_RANK;
  constructor(public payload: IdDefaultPayload<string[]>) {}
}

export class SetBeaconCountAction implements Action {
  readonly type = MachinesCfgActionType.SET_BEACON_COUNT;
  constructor(public payload: IdDefaultPayload<string>) {}
}

export class SetBeaconAction implements Action {
  readonly type = MachinesCfgActionType.SET_BEACON;
  constructor(public payload: IdDefaultPayload) {}
}

export class SetBeaconModuleRankAction implements Action {
  readonly type = MachinesCfgActionType.SET_BEACON_MODULE_RANK;
  constructor(public payload: IdDefaultPayload<string[]>) {}
}

export class SetOverclockAction implements Action {
  readonly type = MachinesCfgActionType.SET_OVERCLOCK;
  constructor(public payload: IdDefaultPayload<number>) {}
}

export type MachinesCfgAction =
  | AddAction
  | RemoveAction
  | RaiseAction
  | LowerAction
  | SetMachineAction
  | SetModuleRankAction
  | SetBeaconCountAction
  | SetBeaconAction
  | SetBeaconModuleRankAction
  | SetOverclockAction;

import { Action } from '@ngrx/store';

import { DefaultIdPayload, IdPayload } from '~/models';
import { Producer } from '~/models/producer';

export const enum ProducersActionType {
  ADD = '[Producers] Add',
  CREATE = '[Producers] Create',
  REMOVE = '[Producers] Remove',
  SET_RECIPE = '[Producers] Set Recipe',
  SET_COUNT = '[Producers] Set Count',
  SET_FACTORY = '[Producers] Set Factory',
  SET_FACTORY_MODULES = '[Producers] Set Modules',
  SET_BEACON_COUNT = '[Producers] Set Beacon Count',
  SET_BEACON = '[Producers] Set Beacon',
  SET_BEACON_MODULES = '[Producers] Set Beacon Modules',
  SET_OVERCLOCK = '[Producers] Set Overclock',
  RESET_PRODUCER = '[Producers] Reset Producer',
}

export class AddAction implements Action {
  readonly type = ProducersActionType.ADD;
  constructor(public payload: string) {}
}

export class CreateAction implements Action {
  readonly type = ProducersActionType.CREATE;
  constructor(public payload: Producer) {}
}

export class RemoveAction implements Action {
  readonly type = ProducersActionType.REMOVE;
  constructor(public payload: string) {}
}

export class SetRecipeAction implements Action {
  readonly type = ProducersActionType.SET_RECIPE;
  constructor(public payload: IdPayload) {}
}

export class SetCountAction implements Action {
  readonly type = ProducersActionType.SET_COUNT;
  constructor(public payload: IdPayload<string>) {}
}

export class SetFactoryAction implements Action {
  readonly type = ProducersActionType.SET_FACTORY;
  constructor(public payload: DefaultIdPayload) {}
}

export class SetFactoryModulesAction implements Action {
  readonly type = ProducersActionType.SET_FACTORY_MODULES;
  constructor(public payload: DefaultIdPayload<string[]>) {}
}

export class SetBeaconCountAction implements Action {
  readonly type = ProducersActionType.SET_BEACON_COUNT;
  constructor(public payload: DefaultIdPayload) {}
}

export class SetBeaconAction implements Action {
  readonly type = ProducersActionType.SET_BEACON;
  constructor(public payload: DefaultIdPayload) {}
}

export class SetBeaconModulesAction implements Action {
  readonly type = ProducersActionType.SET_BEACON_MODULES;
  constructor(public payload: DefaultIdPayload<string[]>) {}
}

export class SetOverclockAction implements Action {
  readonly type = ProducersActionType.SET_OVERCLOCK;
  constructor(public payload: DefaultIdPayload<number>) {}
}

export class ResetProducerAction implements Action {
  readonly type = ProducersActionType.RESET_PRODUCER;
  constructor(public payload: string) {}
}

export type ProducersAction =
  | AddAction
  | CreateAction
  | RemoveAction
  | SetRecipeAction
  | SetCountAction
  | SetFactoryAction
  | SetFactoryModulesAction
  | SetBeaconCountAction
  | SetBeaconAction
  | SetBeaconModulesAction
  | SetOverclockAction
  | ResetProducerAction;

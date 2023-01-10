import { Action } from '@ngrx/store';

import {
  IdDefaultPayload,
  IdIndexDefaultPayload,
  IdIndexPayload,
  IdPayload,
} from '~/models';
import { Producer } from '~/models/producer';

export const enum ProducersActionType {
  ADD = '[Producers] Add',
  CREATE = '[Producers] Create',
  REMOVE = '[Producers] Remove',
  SET_RECIPE = '[Producers] Set Recipe',
  SET_COUNT = '[Producers] Set Count',
  SET_FACTORY = '[Producers] Set Factory',
  SET_FACTORY_MODULES = '[Producers] Set Factory Modules',
  ADD_BEACON = '[Producers] Add Beacon',
  REMOVE_BEACON = '[Producers] Remove Beacon',
  SET_BEACON_COUNT = '[Producers] Set Beacon Count',
  SET_BEACON = '[Producers] Set Beacon',
  SET_BEACON_MODULES = '[Producers] Set Beacon Modules',
  SET_BEACON_TOTAL = '[Recipes] Set Beacon Total',
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
  constructor(public payload: IdDefaultPayload) {}
}

export class SetFactoryModulesAction implements Action {
  readonly type = ProducersActionType.SET_FACTORY_MODULES;
  constructor(public payload: IdDefaultPayload<string[]>) {}
}

export class AddBeaconAction implements Action {
  readonly type = ProducersActionType.ADD_BEACON;
  constructor(public payload: string) {}
}

export class RemoveBeaconAction implements Action {
  readonly type = ProducersActionType.REMOVE_BEACON;
  constructor(public payload: IdPayload<number>) {}
}

export class SetBeaconCountAction implements Action {
  readonly type = ProducersActionType.SET_BEACON_COUNT;
  constructor(public payload: IdIndexDefaultPayload) {}
}

export class SetBeaconAction implements Action {
  readonly type = ProducersActionType.SET_BEACON;
  constructor(public payload: IdIndexDefaultPayload) {}
}

export class SetBeaconModulesAction implements Action {
  readonly type = ProducersActionType.SET_BEACON_MODULES;
  constructor(public payload: IdIndexDefaultPayload<string[]>) {}
}

export class SetBeaconTotalAction implements Action {
  readonly type = ProducersActionType.SET_BEACON_TOTAL;
  constructor(public payload: IdIndexPayload) {}
}

export class SetOverclockAction implements Action {
  readonly type = ProducersActionType.SET_OVERCLOCK;
  constructor(public payload: IdDefaultPayload<number>) {}
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
  | AddBeaconAction
  | RemoveBeaconAction
  | SetBeaconCountAction
  | SetBeaconAction
  | SetBeaconModulesAction
  | SetBeaconTotalAction
  | SetOverclockAction
  | ResetProducerAction;

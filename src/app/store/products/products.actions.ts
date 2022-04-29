import { Action } from '@ngrx/store';

import { DefaultIdPayload, IdPayload, RateType } from '~/models';

export const enum ProductsActionType {
  RESET = '[Products] Reset',
  ADD = '[Products] Add',
  REMOVE = '[Products] Remove',
  SET_ITEM = '[Products] Set Item',
  SET_RATE = '[Products] Set Rate',
  SET_RATE_TYPE = '[Products] Set Rate Type',
  SET_VIA = '[Products] Set Via',
  RESET_VIA = '[Products] Reset Via',
  SET_VIA_SETTING = '[Products] Set Via Setting',
  SET_VIA_FACTORY_MODULES = '[Products] Set Via Factory Modules',
  SET_VIA_BEACON_COUNT = '[Products] Set Via Beacon Count',
  SET_VIA_BEACON = '[Products] Set Via Beacon',
  SET_VIA_BEACON_MODULES = '[Products] Set Via Beacon Modules',
  SET_VIA_OVERCLOCK = '[Products] Set Via Overclock',
  ADJUST_DISPLAY_RATE = '[Products] Adjust Display Rate',
}

export class ResetAction implements Action {
  readonly type = ProductsActionType.RESET;
  constructor(public payload: string) {}
}

export class AddAction implements Action {
  readonly type = ProductsActionType.ADD;
  constructor(public payload: string) {}
}

export class RemoveAction implements Action {
  readonly type = ProductsActionType.REMOVE;
  constructor(public payload: string) {}
}

export class SetItemAction implements Action {
  readonly type = ProductsActionType.SET_ITEM;
  constructor(public payload: IdPayload) {}
}

export class SetRateAction implements Action {
  readonly type = ProductsActionType.SET_RATE;
  constructor(public payload: IdPayload<string>) {}
}

export class SetRateTypeAction implements Action {
  readonly type = ProductsActionType.SET_RATE_TYPE;
  constructor(public payload: IdPayload<RateType>) {}
}

export class SetViaAction implements Action {
  readonly type = ProductsActionType.SET_VIA;
  constructor(public payload: IdPayload) {}
}

export class SetViaSettingAction implements Action {
  readonly type = ProductsActionType.SET_VIA_SETTING;
  constructor(public payload: DefaultIdPayload) {}
}

export class SetViaFactoryModulesAction implements Action {
  readonly type = ProductsActionType.SET_VIA_FACTORY_MODULES;
  constructor(public payload: DefaultIdPayload<string[]>) {}
}

export class SetViaBeaconCountAction implements Action {
  readonly type = ProductsActionType.SET_VIA_BEACON_COUNT;
  constructor(public payload: DefaultIdPayload) {}
}

export class SetViaBeaconAction implements Action {
  readonly type = ProductsActionType.SET_VIA_BEACON;
  constructor(public payload: DefaultIdPayload) {}
}

export class SetViaBeaconModulesAction implements Action {
  readonly type = ProductsActionType.SET_VIA_BEACON_MODULES;
  constructor(public payload: DefaultIdPayload<string[]>) {}
}

export class SetViaOverclockAction implements Action {
  readonly type = ProductsActionType.SET_VIA_OVERCLOCK;
  constructor(public payload: DefaultIdPayload<number>) {}
}

export class ResetViaAction implements Action {
  readonly type = ProductsActionType.RESET_VIA;
  constructor(public payload: string) {}
}

export class AdjustDisplayRateAction implements Action {
  readonly type = ProductsActionType.ADJUST_DISPLAY_RATE;
  constructor(public payload: string) {}
}

export type ProductsAction =
  | ResetAction
  | AddAction
  | RemoveAction
  | SetItemAction
  | SetRateAction
  | SetRateTypeAction
  | SetViaAction
  | SetViaSettingAction
  | SetViaFactoryModulesAction
  | SetViaBeaconCountAction
  | SetViaBeaconAction
  | SetViaBeaconModulesAction
  | SetViaOverclockAction
  | ResetViaAction
  | AdjustDisplayRateAction;

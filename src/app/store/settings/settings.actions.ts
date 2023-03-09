import { Action } from '@ngrx/store';

import {
  DefaultPayload,
  DisplayRate,
  InserterCapacity,
  InserterTarget,
  Preset,
  PreviousPayload,
  ResearchSpeed,
} from '~/models';

export const enum SettingsActionType {
  SET_MOD = '[Settings] Set Mod',
  SET_NET_PRODUCTION_ONLY = '[Settings] Set Net Production Only',
  SET_PRESET = '[Settings] Set Preset',
  SET_BEACON_RECEIVERS = '[Settings] Set Beacon Receivers',
  SET_PROLIFERATOR_SPRAY = '[Settings] Set Proliferator Spray',
  SET_BELT = '[Settings] Set Belt',
  SET_PIPE = '[Settings] Set Pipe',
  SET_FUEL = '[Settings] Set Fuel',
  SET_CARGO_WAGON = '[Settings] Set Cargo Wagon',
  SET_FLUID_WAGON = '[Settings] Set Fluid Wagon',
  SET_FLOW_RATE = '[Settings] Set Flow Rate',
  SET_INSERTER_TARGET = '[Settings] Set Inserter Target',
  SET_MINING_BONUS = '[Settings] Set Mining Bonus',
  SET_RESEARCH_SPEED = '[Settings] Set Research Speed',
  SET_INSERTER_CAPACITY = '[Settings] Set Inserter Capacity',
  SET_DISPLAY_RATE = '[Settings] Set Display Rate',
  SET_COST_FACTOR = '[Settings] Set Cost Factor',
  SET_COST_MACHINE = '[Settings] Set Machine Cost',
  SET_COST_UNPRODUCEABLE = '[Settings] Set Unproduceable Cost',
  SET_COST_EXCLUDED = '[Settings] Set Excluded Cost',
  SET_COST_SURPLUS = '[Settings] Set Surplus Cost',
  SET_COST_MAXIMIZE = '[Settings] Set Maximize Cost',
  RESET_COST = '[Settings] Reset Cost Modifiers',
}

export class SetModAction implements Action {
  readonly type = SettingsActionType.SET_MOD;
  constructor(public payload: string) {}
}

export class SetNetProductionOnlyAction implements Action {
  readonly type = SettingsActionType.SET_NET_PRODUCTION_ONLY;
  constructor(public payload: boolean) {}
}

export class SetPresetAction implements Action {
  readonly type = SettingsActionType.SET_PRESET;
  constructor(public payload: Preset) {}
}

export class SetBeaconReceiversAction implements Action {
  readonly type = SettingsActionType.SET_BEACON_RECEIVERS;
  constructor(public payload: string | null) {}
}

export class SetProliferatorSprayAction implements Action {
  readonly type = SettingsActionType.SET_PROLIFERATOR_SPRAY;
  constructor(public payload: string) {}
}

export class SetBeltAction implements Action {
  readonly type = SettingsActionType.SET_BELT;
  constructor(public payload: DefaultPayload) {}
}

export class SetPipeAction implements Action {
  readonly type = SettingsActionType.SET_PIPE;
  constructor(public payload: DefaultPayload) {}
}

export class SetFuelAction implements Action {
  readonly type = SettingsActionType.SET_FUEL;
  constructor(public payload: DefaultPayload) {}
}

export class SetCargoWagonAction implements Action {
  readonly type = SettingsActionType.SET_CARGO_WAGON;
  constructor(public payload: DefaultPayload) {}
}

export class SetFluidWagonAction implements Action {
  readonly type = SettingsActionType.SET_FLUID_WAGON;
  constructor(public payload: DefaultPayload) {}
}

export class SetFlowRateAction implements Action {
  readonly type = SettingsActionType.SET_FLOW_RATE;
  constructor(public payload: number) {}
}

export class SetInserterTargetAction implements Action {
  readonly type = SettingsActionType.SET_INSERTER_TARGET;
  constructor(public payload: InserterTarget) {}
}

export class SetMiningBonusAction implements Action {
  readonly type = SettingsActionType.SET_MINING_BONUS;
  constructor(public payload: number) {}
}

export class SetResearchSpeedAction implements Action {
  readonly type = SettingsActionType.SET_RESEARCH_SPEED;
  constructor(public payload: ResearchSpeed) {}
}

export class SetInserterCapacityAction implements Action {
  readonly type = SettingsActionType.SET_INSERTER_CAPACITY;
  constructor(public payload: InserterCapacity) {}
}

export class SetDisplayRateAction implements Action {
  readonly type = SettingsActionType.SET_DISPLAY_RATE;
  constructor(public payload: PreviousPayload<DisplayRate>) {}
}

export class SetCostFactorAction implements Action {
  readonly type = SettingsActionType.SET_COST_FACTOR;
  constructor(public payload: string) {}
}

export class SetCostMachineAction implements Action {
  readonly type = SettingsActionType.SET_COST_MACHINE;
  constructor(public payload: string) {}
}

export class SetCostUnproduceableAction implements Action {
  readonly type = SettingsActionType.SET_COST_UNPRODUCEABLE;
  constructor(public payload: string) {}
}

export class SetCostExcludedAction implements Action {
  readonly type = SettingsActionType.SET_COST_EXCLUDED;
  constructor(public payload: string) {}
}

export class SetCostSurplusAction implements Action {
  readonly type = SettingsActionType.SET_COST_SURPLUS;
  constructor(public payload: string) {}
}

export class SetCostMaximizeAction implements Action {
  readonly type = SettingsActionType.SET_COST_MAXIMIZE;
  constructor(public payload: string) {}
}

export class ResetCostAction implements Action {
  readonly type = SettingsActionType.RESET_COST;
}

export type SettingsAction =
  | SetModAction
  | SetNetProductionOnlyAction
  | SetPresetAction
  | SetBeaconReceiversAction
  | SetProliferatorSprayAction
  | SetBeltAction
  | SetPipeAction
  | SetFuelAction
  | SetCargoWagonAction
  | SetFluidWagonAction
  | SetFlowRateAction
  | SetInserterTargetAction
  | SetMiningBonusAction
  | SetResearchSpeedAction
  | SetInserterCapacityAction
  | SetDisplayRateAction
  | SetCostFactorAction
  | SetCostMachineAction
  | SetCostUnproduceableAction
  | SetCostExcludedAction
  | SetCostSurplusAction
  | SetCostMaximizeAction
  | ResetCostAction;

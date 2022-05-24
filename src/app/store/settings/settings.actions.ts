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
  SET_PRESET = '[Settings] Set Preset',
  SET_MOD = '[Settings] Set Mod',
  SET_DISABLED_RECIPES = '[Settings] Set Disabled Recipes',
  SET_BEACON_RECEIVERS = '[Settings] Set Beacon Receivers',
  SET_BELT = '[Settings] Set Belt',
  SET_PIPE = '[Settings] Set Pipe',
  SET_FUEL = '[Settings] Set Fuel',
  SET_FLOW_RATE = '[Settings] Set Flow Rate',
  SET_CARGO_WAGON = '[Settings] Set Cargo Wagon',
  SET_FLUID_WAGON = '[Settings] Set Fluid Wagon',
  SET_DISPLAY_RATE = '[Settings] Set Display Rate',
  SET_MINING_BONUS = '[Settings] Set Mining Bonus',
  SET_RESEARCH_SPEED = '[Settings] Set Research Speed',
  SET_INSERTER_TARGET = '[Settings] Set Inserter Target',
  SET_INSERTER_CAPACITY = '[Settings] Set Inserter Capacity',
  SET_COST_FACTOR = '[Settings] Set Cost Factor',
  SET_COST_FACTORY = '[Settings] Set Factory Cost',
  SET_COST_INPUT = '[Settings] Set Input Cost',
  SET_COST_IGNORED = '[Settings] Set Ignored Cost',
  SET_PROLIFERATOR_SPRAY = '[Settings] Set Proliferator Spray',
  RESET_COST = '[Settings] Reset Cost Modifiers',
}

export class SetPresetAction implements Action {
  readonly type = SettingsActionType.SET_PRESET;
  constructor(public payload: Preset) {}
}

export class SetModAction implements Action {
  readonly type = SettingsActionType.SET_MOD;
  constructor(public payload: string) {}
}

export class SetDisabledRecipesAction implements Action {
  readonly type = SettingsActionType.SET_DISABLED_RECIPES;
  constructor(public payload: DefaultPayload<string[]>) {}
}

export class SetBeaconReceiversAction implements Action {
  readonly type = SettingsActionType.SET_BEACON_RECEIVERS;
  constructor(public payload: string | null) {}
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

export class SetFlowRateAction implements Action {
  readonly type = SettingsActionType.SET_FLOW_RATE;
  constructor(public payload: number) {}
}

export class SetCargoWagonAction implements Action {
  readonly type = SettingsActionType.SET_CARGO_WAGON;
  constructor(public payload: DefaultPayload) {}
}

export class SetFluidWagonAction implements Action {
  readonly type = SettingsActionType.SET_FLUID_WAGON;
  constructor(public payload: DefaultPayload) {}
}

export class SetDisplayRateAction implements Action {
  readonly type = SettingsActionType.SET_DISPLAY_RATE;
  constructor(public payload: PreviousPayload<DisplayRate>) {}
}

export class SetMiningBonusAction implements Action {
  readonly type = SettingsActionType.SET_MINING_BONUS;
  constructor(public payload: number) {}
}

export class SetResearchSpeedAction implements Action {
  readonly type = SettingsActionType.SET_RESEARCH_SPEED;
  constructor(public payload: ResearchSpeed) {}
}

export class SetInserterTargetAction implements Action {
  readonly type = SettingsActionType.SET_INSERTER_TARGET;
  constructor(public payload: InserterTarget) {}
}

export class SetInserterCapacityAction implements Action {
  readonly type = SettingsActionType.SET_INSERTER_CAPACITY;
  constructor(public payload: InserterCapacity) {}
}

export class SetCostFactorAction implements Action {
  readonly type = SettingsActionType.SET_COST_FACTOR;
  constructor(public payload: string) {}
}

export class SetCostFactoryAction implements Action {
  readonly type = SettingsActionType.SET_COST_FACTORY;
  constructor(public payload: string) {}
}

export class SetCostInputAction implements Action {
  readonly type = SettingsActionType.SET_COST_INPUT;
  constructor(public payload: string) {}
}

export class SetCostIgnoredAction implements Action {
  readonly type = SettingsActionType.SET_COST_IGNORED;
  constructor(public payload: string) {}
}

export class SetProliferatorSprayAction implements Action {
  readonly type = SettingsActionType.SET_PROLIFERATOR_SPRAY;
  constructor(public payload: string) {}
}

export class ResetCostAction implements Action {
  readonly type = SettingsActionType.RESET_COST;
}

export type SettingsAction =
  | SetPresetAction
  | SetModAction
  | SetDisabledRecipesAction
  | SetBeaconReceiversAction
  | SetBeltAction
  | SetPipeAction
  | SetFuelAction
  | SetFlowRateAction
  | SetCargoWagonAction
  | SetFluidWagonAction
  | SetDisplayRateAction
  | SetMiningBonusAction
  | SetResearchSpeedAction
  | SetInserterTargetAction
  | SetInserterCapacityAction
  | SetCostFactorAction
  | SetCostFactoryAction
  | SetCostInputAction
  | SetCostIgnoredAction
  | SetProliferatorSprayAction
  | ResetCostAction;

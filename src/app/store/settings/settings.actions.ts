import { Action } from '@ngrx/store';

import {
  DisplayRate,
  ResearchSpeed,
  DefaultPayload,
  Preset,
  InserterTarget,
  InserterCapacity,
} from '~/models';

export const enum SettingsActionType {
  SET_PRESET = '[Settings] Set Preset',
  SET_BASE = '[Settings] Set Base',
  SET_MODS = '[Settings] Set Mods',
  SET_DISABLED_RECIPES = '[Settings] Set Disabled Recipes',
  SET_EXPENSIVE = '[Settings] Set Expensive',
  SET_BELT = '[Settings] Set Belt',
  SET_FUEL = '[Settings] Set Fuel',
  SET_FLOW_RATE = '[Settings] Set Flow Rate',
  SET_DISPLAY_RATE = '[Settings] Set Display Rate',
  SET_MINING_BONUS = '[Settings] Set Mining Bonus',
  SET_RESEARCH_SPEED = '[Settings] Set Research Speed',
  SET_INSERTER_TARGET = '[Settings] Set Inserter Target',
  SET_INSERTER_CAPACITY = '[Settings] Set Inserter Capacity',
}

export class SetPresetAction implements Action {
  readonly type = SettingsActionType.SET_PRESET;
  constructor(public payload: Preset) {}
}

export class SetBaseAction implements Action {
  readonly type = SettingsActionType.SET_BASE;
  constructor(public payload: string) {}
}

export class SetModsAction implements Action {
  readonly type = SettingsActionType.SET_MODS;
  constructor(public payload: DefaultPayload<string[]>) {}
}

export class SetDisabledRecipesAction implements Action {
  readonly type = SettingsActionType.SET_DISABLED_RECIPES;
  constructor(public payload: DefaultPayload<string[]>) {}
}

export class SetExpensiveAction implements Action {
  readonly type = SettingsActionType.SET_EXPENSIVE;
  constructor(public payload: boolean) {}
}

export class SetBeltAction implements Action {
  readonly type = SettingsActionType.SET_BELT;
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

export class SetDisplayRateAction implements Action {
  readonly type = SettingsActionType.SET_DISPLAY_RATE;
  constructor(public payload: DisplayRate) {}
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

export type SettingsAction =
  | SetPresetAction
  | SetBaseAction
  | SetModsAction
  | SetDisabledRecipesAction
  | SetExpensiveAction
  | SetBeltAction
  | SetFuelAction
  | SetFlowRateAction
  | SetDisplayRateAction
  | SetMiningBonusAction
  | SetResearchSpeedAction
  | SetInserterTargetAction
  | SetInserterCapacityAction;

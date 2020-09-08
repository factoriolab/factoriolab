import { Action } from '@ngrx/store';

import {
  DisplayRate,
  ResearchSpeed,
  Theme,
  DefaultPayload,
  DefaultTogglePayload,
  Preset,
} from '~/models';

export const enum SettingsActionType {
  SET_PRESET = '[Settings Page] Set Preset',
  SET_BASE = '[Settings Page] Set Base',
  ENABLE_MOD = '[Settings Page] Enable Mod',
  DISABLE_MOD = '[Settings Page] Disable Mod',
  SET_BELT = '[Settings Page] Set Belt',
  SET_FUEL = '[Settings Page] Set Fuel',
  DISABLE_RECIPE = '[Settings Page] Disable Recipe',
  ENABLE_RECIPE = '[Settings Page] Enable Recipe',
  PREFER_FACTORY = '[Settings Page] Prefer Factory',
  DROP_FACTORY = '[Settings Page] Drop Factory',
  PREFER_MODULE = '[Settings Page] Prefer Module',
  DROP_MODULE = '[Settings Page] Drop Module',
  SET_BEACON_MODULE = '[Settings Page] Set Beacon Module',
  SET_DISPLAY_RATE = '[Settings Page] Set Display Rate',
  SET_ITEM_PRECISION = '[Settings Page] Set Item Precision',
  SET_BELT_PRECISION = '[Settings Page] Set Belt Precision',
  SET_FACTORY_PRECISION = '[Settings Page] Set Factory Precision',
  SET_BEACON_COUNT = '[Settings Page] Set Beacon Count',
  SET_DRILL_MODULE = '[Settings Page] Set Drill Module',
  SET_MINING_BONUS = '[Settings Page] Set Mining Bonus',
  SET_RESEARCH_SPEED = '[Settings Page] Set Research Speed',
  SET_FLOW_RATE = '[Settings Page] Set Flow Rate',
  SET_EXPENSIVE = '[Settings Page] Set Expensive',
  HIDE_COLUMN = '[Settings Page] Hide Column',
  SHOW_COLUMN = '[Settings Page] Show Column',
  SET_THEME = '[Settings Page] Set Theme',
  SHOW_HEADER = '[Settings Page] Show Header',
  HIDE_HEADER = '[Settings Page] Hide Header',
}

export class SetPresetAction implements Action {
  readonly type = SettingsActionType.SET_PRESET;
  constructor(public payload: Preset) {}
}

export class SetBaseAction implements Action {
  readonly type = SettingsActionType.SET_BASE;
  constructor(public payload: string) {}
}

export class EnableModAction implements Action {
  readonly type = SettingsActionType.ENABLE_MOD;
  constructor(public payload: DefaultTogglePayload) {}
}

export class DisableModAction implements Action {
  readonly type = SettingsActionType.DISABLE_MOD;
  constructor(public payload: DefaultTogglePayload) {}
}

export class SetBeltAction implements Action {
  readonly type = SettingsActionType.SET_BELT;
  constructor(public payload: DefaultPayload) {}
}

export class SetFuelAction implements Action {
  readonly type = SettingsActionType.SET_FUEL;
  constructor(public payload: DefaultPayload) {}
}

export class DisableRecipeAction implements Action {
  readonly type = SettingsActionType.DISABLE_RECIPE;
  constructor(public payload: DefaultTogglePayload) {}
}

export class EnableRecipeAction implements Action {
  readonly type = SettingsActionType.ENABLE_RECIPE;
  constructor(public payload: DefaultTogglePayload) {}
}

export class PreferFactoryAction implements Action {
  readonly type = SettingsActionType.PREFER_FACTORY;
  constructor(public payload: DefaultTogglePayload) {}
}

export class DropFactoryAction implements Action {
  readonly type = SettingsActionType.DROP_FACTORY;
  constructor(public payload: DefaultTogglePayload) {}
}

export class PreferModuleAction implements Action {
  readonly type = SettingsActionType.PREFER_MODULE;
  constructor(public payload: DefaultTogglePayload) {}
}

export class DropModuleAction implements Action {
  readonly type = SettingsActionType.DROP_MODULE;
  constructor(public payload: DefaultTogglePayload) {}
}

export class SetBeaconModuleAction implements Action {
  readonly type = SettingsActionType.SET_BEACON_MODULE;
  constructor(public payload: DefaultPayload) {}
}

export class SetDisplayRateAction implements Action {
  readonly type = SettingsActionType.SET_DISPLAY_RATE;
  constructor(public payload: DisplayRate) {}
}

export class SetItemPrecisionAction implements Action {
  readonly type = SettingsActionType.SET_ITEM_PRECISION;
  constructor(public payload: number) {}
}

export class SetBeltPrecisionAction implements Action {
  readonly type = SettingsActionType.SET_BELT_PRECISION;
  constructor(public payload: number) {}
}

export class SetFactoryPrecisionAction implements Action {
  readonly type = SettingsActionType.SET_FACTORY_PRECISION;
  constructor(public payload: number) {}
}

export class SetBeaconCountAction implements Action {
  readonly type = SettingsActionType.SET_BEACON_COUNT;
  constructor(public payload: DefaultPayload<number>) {}
}

export class SetDrillModuleAction implements Action {
  readonly type = SettingsActionType.SET_DRILL_MODULE;
  constructor(public payload: boolean) {}
}

export class SetMiningBonusAction implements Action {
  readonly type = SettingsActionType.SET_MINING_BONUS;
  constructor(public payload: number) {}
}

export class SetResearchSpeedAction implements Action {
  readonly type = SettingsActionType.SET_RESEARCH_SPEED;
  constructor(public payload: ResearchSpeed) {}
}

export class SetFlowRateAction implements Action {
  readonly type = SettingsActionType.SET_FLOW_RATE;
  constructor(public payload: number) {}
}

export class SetExpensiveAction implements Action {
  readonly type = SettingsActionType.SET_EXPENSIVE;
  constructor(public payload: boolean) {}
}

export class HideColumnAction implements Action {
  readonly type = SettingsActionType.HIDE_COLUMN;
  constructor(public payload: string) {}
}

export class ShowColumnAction implements Action {
  readonly type = SettingsActionType.SHOW_COLUMN;
  constructor(public payload: string) {}
}

export class SetThemeAction implements Action {
  readonly type = SettingsActionType.SET_THEME;
  constructor(public payload: Theme) {}
}

export class ShowHeaderAction implements Action {
  readonly type = SettingsActionType.SHOW_HEADER;
}

export class HideHeaderAction implements Action {
  readonly type = SettingsActionType.HIDE_HEADER;
}

export type SettingsAction =
  | SetPresetAction
  | SetBaseAction
  | EnableModAction
  | DisableModAction
  | SetBeltAction
  | SetFuelAction
  | DisableRecipeAction
  | EnableRecipeAction
  | PreferFactoryAction
  | DropFactoryAction
  | PreferModuleAction
  | DropModuleAction
  | SetBeaconModuleAction
  | SetDisplayRateAction
  | SetItemPrecisionAction
  | SetBeltPrecisionAction
  | SetFactoryPrecisionAction
  | SetBeaconCountAction
  | SetDrillModuleAction
  | SetMiningBonusAction
  | SetResearchSpeedAction
  | SetFlowRateAction
  | SetExpensiveAction
  | HideColumnAction
  | ShowColumnAction
  | SetThemeAction
  | HideHeaderAction
  | ShowHeaderAction;

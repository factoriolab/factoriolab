import { Action } from '@ngrx/store';

import {
  DisplayRate,
  ResearchSpeed,
  Theme,
  DefaultPayload,
  DefaultTogglePayload,
  Preset,
  Sort,
  LinkValue,
} from '~/models';

export const enum SettingsActionType {
  SET_PRESET = '[Settings] Set Preset',
  SET_BASE = '[Settings] Set Base',
  ENABLE_MOD = '[Settings] Enable Mod',
  DISABLE_MOD = '[Settings] Disable Mod',
  DISABLE_RECIPE = '[Settings] Disable Recipe',
  ENABLE_RECIPE = '[Settings] Enable Recipe',
  SET_EXPENSIVE = '[Settings] Set Expensive',
  PREFER_FACTORY = '[Settings] Prefer Factory',
  DROP_FACTORY = '[Settings] Drop Factory',
  PREFER_MODULE = '[Settings] Prefer Module',
  DROP_MODULE = '[Settings] Drop Module',
  SET_DRILL_MODULE = '[Settings] Set Drill Module',
  SET_BEACON = '[Settings] Set Beacon',
  SET_BEACON_MODULE = '[Settings] Set Beacon Module',
  SET_BEACON_COUNT = '[Settings] Set Beacon Count',
  SET_BELT = '[Settings] Set Belt',
  SET_FUEL = '[Settings] Set Fuel',
  SET_FLOW_RATE = '[Settings] Set Flow Rate',
  SET_DISPLAY_RATE = '[Settings] Set Display Rate',
  SET_ITEM_PRECISION = '[Settings] Set Item Precision',
  SET_BELT_PRECISION = '[Settings] Set Belt Precision',
  SET_WAGON_PRECISION = '[Settings] Set Wagon Precision',
  SET_FACTORY_PRECISION = '[Settings] Set Factory Precision',
  SET_POWER_PRECISION = '[Settings] Set Power Precision',
  SET_POLLUTION_PRECISION = '[Settings] Set Pollution Precision',
  SET_MINING_BONUS = '[Settings] Set Mining Bonus',
  SET_RESEARCH_SPEED = '[Settings] Set Research Speed',
  HIDE_COLUMN = '[Settings] Hide Column',
  SHOW_COLUMN = '[Settings] Show Column',
  SET_SORT = '[Settings] Set Sort',
  SET_LINK_VALUE = '[Settings] Set Link Value',
  SET_THEME = '[Settings] Set Theme',
  SHOW_HEADER = '[Settings] Show Header',
  HIDE_HEADER = '[Settings] Hide Header',
  RESET = '[Settings] Reset',
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

export class DisableRecipeAction implements Action {
  readonly type = SettingsActionType.DISABLE_RECIPE;
  constructor(public payload: DefaultTogglePayload) {}
}

export class EnableRecipeAction implements Action {
  readonly type = SettingsActionType.ENABLE_RECIPE;
  constructor(public payload: DefaultTogglePayload) {}
}

export class SetExpensiveAction implements Action {
  readonly type = SettingsActionType.SET_EXPENSIVE;
  constructor(public payload: boolean) {}
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

export class SetDrillModuleAction implements Action {
  readonly type = SettingsActionType.SET_DRILL_MODULE;
  constructor(public payload: boolean) {}
}

export class SetBeaconAction implements Action {
  readonly type = SettingsActionType.SET_BEACON;
  constructor(public payload: DefaultPayload) {}
}

export class SetBeaconModuleAction implements Action {
  readonly type = SettingsActionType.SET_BEACON_MODULE;
  constructor(public payload: DefaultPayload) {}
}

export class SetBeaconCountAction implements Action {
  readonly type = SettingsActionType.SET_BEACON_COUNT;
  constructor(public payload: DefaultPayload<number>) {}
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

export class SetItemPrecisionAction implements Action {
  readonly type = SettingsActionType.SET_ITEM_PRECISION;
  constructor(public payload: number) {}
}

export class SetBeltPrecisionAction implements Action {
  readonly type = SettingsActionType.SET_BELT_PRECISION;
  constructor(public payload: number) {}
}

export class SetWagonPrecisionAction implements Action {
  readonly type = SettingsActionType.SET_WAGON_PRECISION;
  constructor(public payload: number) {}
}

export class SetFactoryPrecisionAction implements Action {
  readonly type = SettingsActionType.SET_FACTORY_PRECISION;
  constructor(public payload: number) {}
}

export class SetPowerPrecisionAction implements Action {
  readonly type = SettingsActionType.SET_POWER_PRECISION;
  constructor(public payload: number) {}
}

export class SetPollutionPrecisionAction implements Action {
  readonly type = SettingsActionType.SET_POLLUTION_PRECISION;
  constructor(public payload: number) {}
}

export class SetMiningBonusAction implements Action {
  readonly type = SettingsActionType.SET_MINING_BONUS;
  constructor(public payload: number) {}
}

export class SetResearchSpeedAction implements Action {
  readonly type = SettingsActionType.SET_RESEARCH_SPEED;
  constructor(public payload: ResearchSpeed) {}
}

export class HideColumnAction implements Action {
  readonly type = SettingsActionType.HIDE_COLUMN;
  constructor(public payload: string) {}
}

export class ShowColumnAction implements Action {
  readonly type = SettingsActionType.SHOW_COLUMN;
  constructor(public payload: string) {}
}

export class SetSortAction implements Action {
  readonly type = SettingsActionType.SET_SORT;
  constructor(public payload: Sort) {}
}

export class SetLinkValueAction implements Action {
  readonly type = SettingsActionType.SET_LINK_VALUE;
  constructor(public payload: LinkValue) {}
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

export class ResetAction implements Action {
  readonly type = SettingsActionType.RESET;
}

export type SettingsAction =
  | SetPresetAction
  | SetBaseAction
  | EnableModAction
  | DisableModAction
  | DisableRecipeAction
  | EnableRecipeAction
  | SetExpensiveAction
  | PreferFactoryAction
  | DropFactoryAction
  | PreferModuleAction
  | DropModuleAction
  | SetDrillModuleAction
  | SetBeaconAction
  | SetBeaconModuleAction
  | SetBeaconCountAction
  | SetBeltAction
  | SetFuelAction
  | SetFlowRateAction
  | SetDisplayRateAction
  | SetItemPrecisionAction
  | SetBeltPrecisionAction
  | SetWagonPrecisionAction
  | SetFactoryPrecisionAction
  | SetPowerPrecisionAction
  | SetPollutionPrecisionAction
  | SetMiningBonusAction
  | SetResearchSpeedAction
  | HideColumnAction
  | ShowColumnAction
  | SetSortAction
  | SetLinkValueAction
  | SetThemeAction
  | HideHeaderAction
  | ShowHeaderAction
  | ResetAction;

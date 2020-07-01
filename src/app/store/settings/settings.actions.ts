import { Action } from '@ngrx/store';

import { DisplayRate, ResearchSpeed, Theme, IdPayload } from '~/models';
import { SettingsState } from './settings.reducer';

export const enum SettingsActionType {
  LOAD = '[Settings Router] Load',
  SET_DISPLAY_RATE = '[Settings Page] Set Display Rate',
  SET_ITEM_PRECISION = '[Settings Page] Set Item Precision',
  SET_BELT_PRECISION = '[Settings Page] Set Belt Precision',
  SET_FACTORY_PRECISION = '[Settings Page] Set Factory Precision',
  SET_BELT = '[Settings Page] Set Belt',
  SET_FUEL = '[Settings Page] Set Fuel',
  DISABLE_RECIPE = '[Settings Page] Disable Recipe',
  ENABLE_RECIPE = '[Settings Page] Enable Recipe',
  SET_FACTORY_RANK = '[Settings Page] Set Factory Rank',
  SET_MODULE_RANK = '[Settings Page] Set Module Rank',
  SET_BEACON_MODULE = '[Settings Page] Set Beacon Module',
  SET_BEACON_COUNT = '[Settings Page] Set Beacon Count',
  SET_DRILL_MODULE = '[Settings Page] Set Drill Module',
  SET_MINING_BONUS = '[Settings Page] Set Mining Bonus',
  SET_RESEARCH_SPEED = '[Settings Page] Set Research Speed',
  SET_FLOW_RATE = '[Settings Page] Set Flow Rate',
  SET_EXPENSIVE = '[Settings Page] Set Expensive',
  SET_THEME = '[Settings Page] Set Theme',
}

export class LoadAction implements Action {
  readonly type = SettingsActionType.LOAD;
  constructor(public payload: SettingsState) {}
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

export class SetBeltAction implements Action {
  readonly type = SettingsActionType.SET_BELT;
  constructor(public payload: string) {}
}

export class SetFuelAction implements Action {
  readonly type = SettingsActionType.SET_FUEL;
  constructor(public payload: string) {}
}

export class DisableRecipeAction implements Action {
  readonly type = SettingsActionType.DISABLE_RECIPE;
  constructor(public payload: string) {}
}

export class EnableRecipeAction implements Action {
  readonly type = SettingsActionType.ENABLE_RECIPE;
  constructor(public payload: string) {}
}

export class SetFactoryRankAction implements Action {
  readonly type = SettingsActionType.SET_FACTORY_RANK;
  constructor(public payload: IdPayload<number>) {}
}

export class SetModuleRankAction implements Action {
  readonly type = SettingsActionType.SET_MODULE_RANK;
  constructor(public payload: IdPayload<number>) {}
}

export class SetBeaconModuleAction implements Action {
  readonly type = SettingsActionType.SET_BEACON_MODULE;
  constructor(public payload: string) {}
}

export class SetBeaconCountAction implements Action {
  readonly type = SettingsActionType.SET_BEACON_COUNT;
  constructor(public payload: number) {}
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

export class SetTheme implements Action {
  readonly type = SettingsActionType.SET_THEME;
  constructor(public payload: Theme) {}
}

export type SettingsAction =
  | LoadAction
  | SetDisplayRateAction
  | SetItemPrecisionAction
  | SetBeltPrecisionAction
  | SetFactoryPrecisionAction
  | SetBeltAction
  | SetFuelAction
  | DisableRecipeAction
  | EnableRecipeAction
  | SetFactoryRankAction
  | SetModuleRankAction
  | SetBeaconModuleAction
  | SetBeaconCountAction
  | SetDrillModuleAction
  | SetMiningBonusAction
  | SetResearchSpeedAction
  | SetFlowRateAction
  | SetExpensiveAction
  | SetTheme;

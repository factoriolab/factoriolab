import { Action } from '@ngrx/store';

import { DisplayRate, ItemId, RecipeId, ResearchSpeed, Theme } from '~/models';
import { SettingsState } from './settings.reducer';

export const enum SettingsActionType {
  LOAD = '[Settings Router] Load',
  SET_DISPLAY_RATE = '[Settings Page] Set Display Rate',
  SET_ITEM_PRECISION = '[Settings Page] Set Item Precision',
  SET_BELT_PRECISION = '[Settings Page] Set Belt Precision',
  SET_FACTORY_PRECISION = '[Settings Page] Set Factory Precision',
  SET_BELT = '[Settings Page] Set Belt',
  DISABLE_RECIPE = '[Settings Page] Disable Recipe',
  ENABLE_RECIPE = '[Settings Page] Enable Recipe',
  SET_ASSEMBLER = '[Settings Page] Set Assembler',
  SET_FURNACE = '[Settings Page] Set Furnace',
  SET_PROD_MODULE = '[Settings Page] Set Prod Module',
  SET_SPEED_MODULE = '[Settings Page] Set Speed Module',
  SET_BEACON_MODULE = '[Settings Page] Set Beacon Module',
  SET_BEACON_COUNT = '[Settings Page] Set Beacon Count',
  SET_OIL_RECIPE = '[Settings Page] Set Oil Recipe',
  SET_FUEL = '[Settings Page] Set Fuel',
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
  constructor(public payload: ItemId) {}
}

export class SetAssemblerAction implements Action {
  readonly type = SettingsActionType.SET_ASSEMBLER;
  constructor(public payload: ItemId) {}
}

export class SetFurnaceAction implements Action {
  readonly type = SettingsActionType.SET_FURNACE;
  constructor(public payload: ItemId) {}
}

export class DisableRecipe implements Action {
  readonly type = SettingsActionType.DISABLE_RECIPE;
  constructor(public payload: RecipeId) {}
}

export class EnableRecipe implements Action {
  readonly type = SettingsActionType.ENABLE_RECIPE;
  constructor(public payload: RecipeId) {}
}

export class SetProdModuleAction implements Action {
  readonly type = SettingsActionType.SET_PROD_MODULE;
  constructor(public payload: ItemId) {}
}

export class SetSpeedModuleAction implements Action {
  readonly type = SettingsActionType.SET_SPEED_MODULE;
  constructor(public payload: ItemId) {}
}

export class SetBeaconModuleAction implements Action {
  readonly type = SettingsActionType.SET_BEACON_MODULE;
  constructor(public payload: ItemId) {}
}

export class SetBeaconCountAction implements Action {
  readonly type = SettingsActionType.SET_BEACON_COUNT;
  constructor(public payload: number) {}
}

export class SetFuelAction implements Action {
  readonly type = SettingsActionType.SET_FUEL;
  constructor(public payload: ItemId) {}
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
  | SetAssemblerAction
  | SetFurnaceAction
  | DisableRecipe
  | EnableRecipe
  | SetFuelAction
  | SetProdModuleAction
  | SetSpeedModuleAction
  | SetBeaconModuleAction
  | SetBeaconCountAction
  | SetDrillModuleAction
  | SetMiningBonusAction
  | SetResearchSpeedAction
  | SetFlowRateAction
  | SetExpensiveAction
  | SetTheme;

import { Action } from '@ngrx/store';

import { DisplayRate, ItemId, RecipeId } from '~/models';

export const enum SettingsActionType {
  SET_DISPLAY_RATE = '[Settings Page] Set Display Rate',
  SET_BELT = '[Settings Page] Set Belt',
  SET_OIL_RECIPE = '[Settings Page] Set Oil Recipe',
  SET_USE_CRACKING = '[Setting Page] Set Use Cracking',
}

export class SetDisplayRateAction implements Action {
  readonly type = SettingsActionType.SET_DISPLAY_RATE;
  constructor(public payload: DisplayRate) {}
}

export class SetBeltAction implements Action {
  readonly type = SettingsActionType.SET_BELT;
  constructor(public payload: ItemId) {}
}

export class SetOilProcessingRecipeAction implements Action {
  readonly type = SettingsActionType.SET_OIL_RECIPE;
  constructor(public payload: RecipeId) {}
}

export class SetUseCrackingAction implements Action {
  readonly type = SettingsActionType.SET_USE_CRACKING;
  constructor(public payload: boolean) {}
}

export type SettingsAction =
  | SetDisplayRateAction
  | SetBeltAction
  | SetOilProcessingRecipeAction
  | SetUseCrackingAction;

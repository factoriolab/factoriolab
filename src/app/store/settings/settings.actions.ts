import { Action } from '@ngrx/store';
import { DisplayRate } from 'src/app/models';

export const enum SettingsActionType {
  SET_DISPLAY_RATE = '[Settings Page] Set Display Rate',
  SET_BELT = '[Settings Page] Set Belt',
  SET_OIL_RECIPE = '[Settings Page] Set Oil Recipe',
  SET_USE_CRACKING = '[Setting Page] Set Use Cracking'
}

export class SetDisplayRateAction implements Action {
  readonly type = SettingsActionType.SET_DISPLAY_RATE;
  constructor(public payload: DisplayRate) {}
}

export class SetBeltAction implements Action {
  readonly type = SettingsActionType.SET_BELT;
  constructor(public payload: string) {}
}

export class SetOilProcessingRecipeAction implements Action {
  readonly type = SettingsActionType.SET_OIL_RECIPE;
  constructor(public payload: string) {}
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

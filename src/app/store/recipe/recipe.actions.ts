import { Action } from '@ngrx/store';

import { RecipeId, ItemId } from '~/models';
import { RecipeState } from './recipe.reducer';

export const enum RecipeActionType {
  LOAD = '[Recipes Router] Load',
  IGNORE = '[Recipes Page] Ignore Recipe',
  EDIT_BEACON_TYPE = '[Recipes Page] Edit Beacon Type',
  EDIT_BEACONS_COUNT = '[Recipes Page] Edit Beacon Count',
}

export class LoadAction implements Action {
  readonly type = RecipeActionType.LOAD;
  constructor(public payload: RecipeState) {}
}

export class IgnoreAction implements Action {
  readonly type = RecipeActionType.IGNORE;
  constructor(public payload: RecipeId) {}
}

export class EditBeaconTypeAction implements Action {
  readonly type = RecipeActionType.EDIT_BEACON_TYPE;
  constructor(public payload: [RecipeId, ItemId]) {}
}

export class EditBeaconCountAction implements Action {
  readonly type = RecipeActionType.EDIT_BEACONS_COUNT;
  constructor(public payload: [RecipeId, number]) {}
}

export type RecipeAction =
  | LoadAction
  | IgnoreAction
  | EditBeaconTypeAction
  | EditBeaconCountAction;

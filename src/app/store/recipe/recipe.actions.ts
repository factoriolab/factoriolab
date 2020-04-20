import { Action } from '@ngrx/store';

import { RecipeId, ItemId } from '~/models';

export const enum RecipeActionType {
  IGNORE_RECIPE = '[Recipes Page] Ignore Recipe',
  EDIT_BEACON_TYPE = '[Recipes Page] Edit Beacon Type',
  EDIT_BEACONS_COUNT = '[Recipes Page] Edit Beacon Count',
}

export class IgnoreRecipeAction implements Action {
  readonly type = RecipeActionType.IGNORE_RECIPE;
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
  | IgnoreRecipeAction
  | EditBeaconTypeAction
  | EditBeaconCountAction;

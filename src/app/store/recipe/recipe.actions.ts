import { Action } from '@ngrx/store';

export enum RecipeActionType {
  IGNORE_RECIPE = '[Recipes Page] Ignore Recipe'
}

export class IgnoreRecipeAction implements Action {
  readonly type = RecipeActionType.IGNORE_RECIPE;
  constructor(public payload: string) {}
}

export type RecipeAction = IgnoreRecipeAction;

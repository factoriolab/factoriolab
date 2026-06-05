import { AdjustedRecipe } from '~/data/schema/recipe';
import { Rational } from '~/rational/rational';

import { RecipeSettings } from '../recipes/recipe-settings';
import { RecipeState } from '../recipes/recipe-state';
import { ObjectiveType } from './objective-type';
import { ObjectiveUnit } from './objective-unit';

export function isRecipeObjective(obj: ObjectiveState): obj is RecipeObjective {
  return obj.unit === ObjectiveUnit.Machines;
}

export interface ObjectiveBase {
  /** If unit is ObjectiveUnit.Machines, a recipe id; otherwise an item id */
  targetId: string;
  value: Rational;
  unit: ObjectiveUnit;
  type: ObjectiveType;
}

interface Objective extends ObjectiveBase {
  id: string;
  recipe?: AdjustedRecipe;
}

export type ObjectiveState = Objective & RecipeState;

export type ObjectiveSettings = Objective & RecipeSettings;

export interface RecipeObjective extends Objective {
  unit: ObjectiveUnit.Machines;
  recipe: AdjustedRecipe;
}

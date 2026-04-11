import { AdjustedRecipe } from './data/recipe';
import { ObjectiveType } from './enum/objective-type';
import { ObjectiveUnit } from './enum/objective-unit';
import { Rational } from './rational';
import { RecipeSettings, RecipeState } from './settings/recipe-settings';

/** Sentinel prefix for global objectives (power, pollution, etc.) */
const GLOBAL_PREFIX = 'global|';

export function globalTargetId(kind: string): string {
  return GLOBAL_PREFIX + kind;
}

export function isGlobalObjective(obj: ObjectiveBase): boolean {
  return obj.targetId.startsWith(GLOBAL_PREFIX);
}

export function isRecipeObjective(obj: ObjectiveState): obj is RecipeObjective {
  return (
    obj.unit === ObjectiveUnit.Machines ||
    (obj.unit === ObjectiveUnit.Power && !isGlobalObjective(obj))
  );
}

export function isGlobalPowerObjective(obj: ObjectiveBase): boolean {
  return (
    obj.unit === ObjectiveUnit.Power &&
    obj.targetId === globalTargetId('power')
  );
}

export interface ObjectiveBase {
  /**
   * If unit is Machines, a recipe id.
   * If unit is Power with a recipe target, a recipe id (per-step power).
   * If targetId starts with 'global|', a global objective (e.g. power balance).
   * Otherwise an item id.
   */
  targetId: string;
  unit: ObjectiveUnit;
  type?: ObjectiveType;
}

interface Objective extends ObjectiveBase {
  id: string;
  value: Rational;
  type: ObjectiveType;
  recipe?: AdjustedRecipe;
}

export type ObjectiveState = Objective & RecipeState;

export type ObjectiveSettings = Objective & RecipeSettings;

export interface RecipeObjective extends Objective {
  unit: ObjectiveUnit.Machines | ObjectiveUnit.Power;
  recipe: AdjustedRecipe;
}

import { RecipeRational } from './data';
import { ObjectiveType, ObjectiveUnit } from './enum';
import { Rational } from './rational';
import { RecipeSettings, RecipeSettingsRational } from './settings';

export function isRecipeObjective(obj: Objective | ObjectiveRational): boolean {
  return obj.unit === ObjectiveUnit.Machines;
}

export function isRecipeRationalObjective(
  obj: ObjectiveRational,
): obj is RecipeObjectiveRational {
  return obj.unit === ObjectiveUnit.Machines;
}

export interface ObjectiveBase {
  /** If unit is ObjectiveUnit.Machines, a recipe id; otherwise an item id */
  targetId: string;
  unit: ObjectiveUnit;
}

export interface Objective extends ObjectiveBase, RecipeSettings {
  id: string;
  /** If unit is ObjectiveUnit.Machines, a recipe id; otherwise an item id */
  targetId: string;
  value: string;
  unit: ObjectiveUnit;
  type: ObjectiveType;
}

export class ObjectiveRational extends RecipeSettingsRational {
  id: string;
  /** If unit is ObjectiveUnit.Machines, a recipe id; otherwise an item id */
  targetId: string;
  value: Rational;
  unit: ObjectiveUnit;
  type: ObjectiveType;
  recipe?: RecipeRational;

  constructor(obj: Objective, recipe?: RecipeRational) {
    super(obj);

    this.id = obj.id;
    this.targetId = obj.targetId;
    this.value = Rational.fromString(obj.value);
    this.unit = obj.unit;
    this.type = obj.type;

    if (recipe != null) {
      this.recipe = recipe;
    }
  }
}

export interface RecipeObjectiveRational extends ObjectiveRational {
  unit: ObjectiveUnit.Machines;
  recipe: RecipeRational;
}

import { RecipeRational } from './data';
import { ObjectiveType } from './enum';
import { Rational } from './rational';
import { RecipeSettings, RecipeSettingsRational } from './settings';

export interface RecipeObjective extends RecipeSettings {
  id: string;
  recipeId: string;
  count: string;
  type: ObjectiveType;
}

export class RecipeObjectiveRational extends RecipeSettingsRational {
  id: string;
  recipeId: string;
  count: Rational;
  type: ObjectiveType;
  recipe: RecipeRational;

  constructor(obj: RecipeObjective, recipe: RecipeRational) {
    super(obj);

    this.id = obj.id;
    this.recipeId = obj.recipeId;
    this.count = Rational.fromString(obj.count);
    this.type = obj.type;
    this.recipe = recipe;
  }
}

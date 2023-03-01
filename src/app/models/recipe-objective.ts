import { RationalRecipe } from './data';
import { Rational } from './rational';
import { RationalRecipeSettings, RecipeSettings } from './settings';

export interface RecipeObjective extends RecipeSettings {
  id: string;
  recipeId: string;
  count: string;
}

export class RationalRecipeObjective extends RationalRecipeSettings {
  id: string;
  recipeId: string;
  count: Rational;
  recipe: RationalRecipe;

  constructor(obj: RecipeObjective, recipe: RationalRecipe) {
    super(obj);

    this.id = obj.id;
    this.recipeId = obj.recipeId;
    this.count = Rational.fromString(obj.count);
    this.recipe = recipe;
  }
}

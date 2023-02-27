import { RationalRecipe } from './data';
import { Rational } from './rational';
import { RationalRecipeSettings, RecipeSettings } from './settings';

export interface Producer extends RecipeSettings {
  id: string;
  recipeId: string;
  count: string;
}

export class RationalProducer extends RationalRecipeSettings {
  id: string;
  recipeId: string;
  count: Rational;
  recipe: RationalRecipe;

  constructor(obj: Producer, recipe: RationalRecipe) {
    super(obj);

    this.id = obj.id;
    this.recipeId = obj.recipeId;
    this.count = Rational.fromString(obj.count);
    this.recipe = recipe;
  }
}

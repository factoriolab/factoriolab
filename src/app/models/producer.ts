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

  constructor(data: Producer, recipe: RationalRecipe) {
    super(data);

    this.id = data.id;
    this.recipeId = data.recipeId;
    this.count = Rational.fromString(data.count);
    this.recipe = recipe;
  }
}

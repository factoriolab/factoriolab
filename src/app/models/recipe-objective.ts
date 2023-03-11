import { RecipeCfg, RecipeRtlCfg } from './config';
import { RecipeRtl } from './data';
import { ObjectiveType } from './enum';
import { Rational } from './rational';

/** Recipe objective configuration */
export interface RecipeObj extends RecipeCfg {
  id: string;
  recipeId: string;
  count: string;
  type: ObjectiveType;
}

/** Recipe objective rational configuration */
export class RecipeRtlObj extends RecipeRtlCfg {
  id: string;
  recipeId: string;
  count: Rational;
  type: ObjectiveType;
  recipe: RecipeRtl;

  constructor(obj: RecipeObj, recipe: RecipeRtl) {
    super(obj);

    this.id = obj.id;
    this.recipeId = obj.recipeId;
    this.count = Rational.fromString(obj.count);
    this.type = obj.type;
    this.recipe = recipe;
  }
}

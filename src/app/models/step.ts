import { ItemId } from './data/item';
import { RecipeId } from './data/recipe';
import { Entities } from './entities';
import { Rational } from './rational';
import { RecipeSettings } from './recipe-settings';

export interface Step {
  itemId: ItemId;
  recipeId: RecipeId;
  items: Rational;
  settings: RecipeSettings;
  surplus?: Rational;
  belts?: Rational;
  factories?: Rational;
  parents?: Entities<Rational>;
}

import { Entities } from './entities';
import { ItemId } from './item';
import { Rational } from './rational';
import { RecipeId } from './recipe';
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

import { ItemId } from './data/item';
import { RecipeId } from './data/recipe';
import { Entities } from './entities';
import { Rational } from './rational';

export interface Step {
  itemId: ItemId;
  items: Rational;
  surplus?: Rational;
  belts?: Rational;
  factories?: Rational;
  recipeId?: RecipeId;
  parents?: Entities<Rational>;
}

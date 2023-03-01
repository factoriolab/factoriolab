import { RationalRecipe } from './data';
import { Entities } from './entities';
import { Rational } from './rational';
import { RationalRecipeSettings } from './settings';

export interface Step {
  id: string;
  /**
   * Priority: 1) Item state, 2) Producer state, 3) Recipe state
   *
   * If an item is excluded, step should still be checked, therefore item state
   * must be highest priority. Producer state takes priority over recipe since
   * recipe state may be present on a separate step.
   */
  checked?: boolean;
  itemId?: string;
  items?: Rational;
  output?: Rational;
  surplus?: Rational;
  belts?: Rational;
  wagons?: Rational;
  /** Fraction of this item requested by each step */
  parents?: Entities<Rational>;
  /** Fraction this recipe produces of each item */
  outputs?: Entities<Rational>;
  recipeId?: string;
  recipe?: RationalRecipe;
  recipeSettings?: RationalRecipeSettings;
  machines?: Rational;
  power?: Rational;
  pollution?: Rational;
  producerId?: string;
}

import { AdjustedRecipe } from './data/recipe';
import { Rational } from './rational';
import { RecipeSettings } from './settings/recipe-settings';
import { Entities } from './utils';

export interface Step {
  id: string;
  /**
   * Priority: 1) Item state, 2) Recipe objective state, 3) Recipe state
   *
   * If an item is excluded, step should still be checked, therefore item state
   * must be highest priority. Recipe objective state takes priority over recipe since
   * recipe state may be present on a separate step.
   */
  checked?: boolean;
  itemId?: string;
  /** Amount of item produced by all recipes */
  items?: Rational;
  /** Amount of item that goes towards objectives */
  output?: Rational;
  /** Amount of item that is unused */
  surplus?: Rational;
  belts?: Rational;
  wagons?: Rational;
  /**
   * Fraction of this item requested by each step, or output denoted by key `''`
   */
  parents?: Entities<Rational>;
  /** Fraction this recipe produces of each item */
  outputs?: Entities<Rational>;
  recipeId?: string;
  recipe?: AdjustedRecipe;
  recipeSettings?: RecipeSettings;
  machines?: Rational;
  power?: Rational;
  pollution?: Rational;
  recipeObjectiveId?: string;
  /** Depth of this node in a justified sankey diagram */
  depth?: number;
}

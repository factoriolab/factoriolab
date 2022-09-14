import { RationalRecipe } from './data';
import { Entities } from './entities';
import { Rational } from './rational';
import { RationalRecipeSettings } from './settings';

export interface Step {
  id: string;
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
  factories?: Rational;
  beacons?: Rational;
  power?: Rational;
  pollution?: Rational;
  producerId?: string;
}

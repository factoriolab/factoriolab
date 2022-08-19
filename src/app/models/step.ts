import { Entities } from './entities';
import { Rational } from './rational';

export interface Step {
  id: string;
  itemId?: string;
  items?: Rational;
  surplus?: Rational;
  belts?: Rational;
  wagons?: Rational;
  /** Fraction of this item requested by each recipe */
  parents?: Entities<Rational>;
  /** Fraction this recipe produces of each item */
  outputs?: Entities<Rational>;
  recipeId?: string;
  factories?: Rational;
  beacons?: Rational;
  power?: Rational;
  pollution?: Rational;
}

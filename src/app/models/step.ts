import { Entities } from './entities';
import { Rational } from './rational';

export interface Step {
  id: string;
  itemId?: string;
  items?: Rational;
  surplus?: Rational;
  belts?: Rational;
  wagons?: Rational;
  parents?: Entities<Rational>;
  outputs?: Entities<Rational>;
  recipeId?: string;
  factories?: Rational;
  beacons?: Rational;
  power?: Rational;
  pollution?: Rational;
}

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
  maintenance1?: Rational;
  maintenance2?: Rational;
  maintenance3?: Rational;
  pollution?: Rational;
}

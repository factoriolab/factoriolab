import { Entities } from './entities';
import { Rational } from './rational';

export interface Step {
  id?: string;
  indent?: number;
  itemId: string;
  items: Rational;
  surplus?: Rational;
  belts?: Rational;
  wagons?: Rational;
  factories?: Rational;
  power?: Rational;
  pollution?: Rational;
  recipeId?: string;
  parents?: Entities<Rational>;
  outputs?: Entities<Rational>;
  href?: string;
}

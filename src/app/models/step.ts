import { Entities } from './entities';
import { Rational } from './rational';

export interface Step {
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
  href?: string;
}

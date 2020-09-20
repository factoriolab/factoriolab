import { Entities } from './entities';
import { Rational } from './rational';

export interface Step {
  itemId: string;
  items: Rational;
  depth: number;
  surplus?: Rational;
  belts?: Rational;
  wagons?: Rational;
  factories?: Rational;
  power?: Rational;
  pollution?: Rational;
  recipeId?: string;
  parents?: Entities<Rational>;
}

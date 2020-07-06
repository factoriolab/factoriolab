import { Entities } from './entities';
import { Rational } from './rational';

export interface Step {
  itemId: string;
  items: Rational;
  surplus?: Rational;
  belts?: Rational;
  factories?: Rational;
  recipeId?: string;
  parents?: Entities<Rational>;
}

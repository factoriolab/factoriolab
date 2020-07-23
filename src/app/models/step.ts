import { Entities } from './entities';
import { Rational } from './rational';

export interface Step {
  itemId: string;
  items: Rational;
  depth: number;
  surplus?: Rational;
  belts?: Rational;
  factories?: Rational;
  recipeId?: string;
  parents?: Entities<Rational>;
}

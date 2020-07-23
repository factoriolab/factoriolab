import { Entities } from './entities';
import { Rational } from './rational';

interface StepBase {
  itemId: string;
  items: Rational;
  surplus?: Rational;
  belts?: Rational;
  factories?: Rational;
  recipeId?: string;
  parents?: Entities<Rational>;
}

export interface Step extends StepBase {
  depth: number;
}

export interface Node extends StepBase {
  id: string;
  name: string;
  children?: Node[];
}

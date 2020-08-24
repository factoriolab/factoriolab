import { Entities } from './entities';
import { Rational } from './rational';

export interface StepBase {
  itemId: string;
  items: Rational;
  surplus?: Rational;
  belts?: Rational;
  factories?: Rational;
  consumption?: Rational;
  pollution?: Rational;
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

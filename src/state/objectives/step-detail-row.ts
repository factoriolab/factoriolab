import { Rational } from '~/rational/rational';

export interface StepDetailRow {
  items?: Rational;
  itemId?: string;
  belts?: Rational;
  beltId?: string;
  stack?: Rational;
  wagons?: Rational;
  wagonId?: string;
  machines?: Rational;
  machineId?: string;
  recipeId?: string;
  recipeObjectiveId?: string;
  percent?: Rational;
  percentOnDest?: boolean;
  destId?: string;
  destRecipeObjectiveId?: string;
  destType?: 'item' | 'recipe';
  isInput?: boolean;
  isOutput?: boolean;
}

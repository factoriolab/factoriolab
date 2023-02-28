import { MatrixResultType } from './enum';
import { RationalProducer } from './producer';
import { Rational } from './rational';
import { Step } from './step';

export interface MatrixResult {
  steps: Step[];
  resultType: MatrixResultType;
  /** Runtime in ms */
  time?: number;
  /** Total cost of solution */
  cost?: Rational;
  /** Items in tableau */
  itemIds?: string[];
  /** Producers in tableau */
  producers?: RationalProducer[];
  /** Recipes in tableau */
  recipeIds?: string[];
  /** Items identified as inputs in tableau */
  inputIds?: string[];
}

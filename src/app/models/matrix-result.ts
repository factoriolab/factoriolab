import { MatrixResultType } from './enum';
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
  /** Recipes in tableau */
  recipeIds?: string[];
  /** Items identified as inputs in tableau */
  inputIds?: string[];
}

import { MatrixResultType } from './enum';
import { Rational } from './rational';
import { Step } from './step';

export interface MatrixResult {
  steps: Step[];
  result: MatrixResultType;
  /** Final number of simplex pivots */
  pivots?: number;
  /** Runtime in ms */
  time?: number;
  /** Simplex canonical matrix */
  A?: Rational[][];
  /** Simplex objective solution */
  O?: Rational[];
  /** Items in tableau */
  itemIds?: string[];
  /** Recipes in tableau */
  recipeIds?: string[];
  /** Items identified as inputs in tableau */
  inputIds?: string[];
}

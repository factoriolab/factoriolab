import { Simplex } from 'glpk-ts';
import { StatusSimplex } from 'glpk-ts/dist/status';

import { MatrixResultType } from './enum';
import { Rational } from './rational';
import { Step } from './step';

export interface MatrixResult {
  steps: Step[];
  resultType: MatrixResultType;
  /** GLPK simplex return code */
  returnCode?: Simplex.ReturnCode;
  /** GLPK model simplex status */
  simplexStatus?: StatusSimplex;
  /** Runtime in ms */
  time?: number;
  /** Total cost of solution */
  cost?: Rational;
  /** Items in tableau */
  itemIds?: string[];
  /** Recipes in tableau */
  recipeIds?: string[];
  /** Items identified as unproduceable */
  unproduceableIds?: string[];
}

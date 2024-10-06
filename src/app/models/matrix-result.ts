import { Simplex } from 'glpk-ts';
import { StatusSimplex } from 'node_modules/glpk-ts/dist/status';

import { SimplexResultType } from './enum/simplex-result-type';
import { Rational } from './rational';
import { Step } from './step';

export interface MatrixResult {
  steps: Step[];
  resultType: SimplexResultType;
  /** GLPK simplex return code */
  returnCode?: Simplex.ReturnCode;
  /** GLPK model simplex status */
  simplexStatus?: StatusSimplex;
  /** If simplex solution is unbounded, the recipe that represents the ray */
  unboundedRecipeId?: string;
  /** Runtime in ms */
  time?: number;
  /** Total cost of solution */
  cost?: Rational;
}

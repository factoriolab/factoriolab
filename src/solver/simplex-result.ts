import { Simplex } from 'glpk-ts';
import { StatusSimplex } from 'node_modules/glpk-ts/dist/status';

import { Rational } from '~/rational/rational';

import { SimplexResultType } from './simplex-result-type';
import { Step } from './step';

export interface SimplexResult {
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

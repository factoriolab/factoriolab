import { Status } from 'glpk-ts';

import { Rational } from '~/rational/rational';

import { GlpkReturnCode } from './glpk-result';
import { SimplexResultType } from './simplex-result-type';
import { Step } from './step';

export interface SimplexResult {
  steps: Step[];
  resultType: SimplexResultType;
  /** GLPK simplex return code */
  returnCode?: GlpkReturnCode;
  /** GLPK model simplex status */
  simplexStatus?: Status;
  /** If simplex solution is unbounded, the recipe that represents the ray */
  unboundedRecipeId?: string;
  /** Runtime in ms */
  time?: number;
  /** Total cost of solution */
  cost?: Rational;
}

import { Simplex } from 'glpk-ts';
import { StatusSimplex } from 'glpk-ts/dist/status';

import { SimplexResultType } from './enum';
import { Rational } from './rational';
import { Step } from './step';

export interface MatrixResult {
  steps: Step[];
  resultType: SimplexResultType;
  /** GLPK simplex return code */
  returnCode?: Simplex.ReturnCode;
  /** GLPK model simplex status */
  simplexStatus?: StatusSimplex;
  /** Runtime in ms */
  time?: number;
  /** Total cost of solution */
  cost?: Rational;
}

import { Simplex, Status } from 'glpk-ts';

import { Rational } from '~/rational/rational';

export interface GlpkResult {
  surplus: Record<string, Rational>;
  recipes: Record<string, Rational>;
  unproduceable: Record<string, Rational>;
  excluded: Record<string, Rational>;
  cost: Rational;
  returnCode: Simplex.ReturnCode;
  status: Status;
  unboundedRecipeId?: string;
  error: boolean;
  time: number;
}

import { Status } from 'glpk-ts';

import { Rational } from '~/rational/rational';

import { GlpkReturnCode } from './glpk-result';
import { SimplexResultType } from './simplex-result-type';

export interface SimplexSolution {
  resultType: SimplexResultType;
  /** GLPK simplex return code */
  returnCode?: GlpkReturnCode;
  /** GLPK model simplex status */
  simplexStatus?: Status;
  /** If simplex solution is unbounded, the recipe that represents the ray */
  unboundedRecipeId?: string;
  /** Runtime in ms */
  time: number;
  /** Overall simplex solution cost */
  cost: Rational;
  /** Items in tableau */
  itemIds: string[];
  /** Recipes in tableau */
  recipeIds: string[];
  /** Items identified as unproduceable */
  unproduceableIds: Set<string>;
  /** Items excluded */
  excludedIds: Set<string>;
  /** Surplus items, may be empty */
  surplus: Record<string, Rational>;
  /** Unproduceable items (no recipe), may be empty */
  unproduceable: Record<string, Rational>;
  /** Excluded items, may be empty */
  excluded: Record<string, Rational>;
  /** Recipe values of the solution */
  recipes: Record<string, Rational>;
}

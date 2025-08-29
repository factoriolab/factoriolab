import { AdjustedRecipe } from '~/data/schema/recipe';
import { Rational } from '~/models/rational';
import { ObjectiveState, RecipeObjective } from '~/state/objectives/objective';
import { CostSettings } from '~/state/settings/cost-settings';
import { AdjustedDataset } from '~/state/settings/dataset';
import { MaximizeType } from '~/state/settings/maximize-type';

import { ItemValues } from './item-values';
import { Step } from './step';

export interface SimplexState {
  objectives: ObjectiveState[];
  /**
   * Output & Maximize recipe objectives
   *  * Limits moved to `recipeLimits`
   *  * Inputs added to `itemValues`
   */
  recipeObjectives: RecipeObjective[];
  steps: Step[];
  /** Recipes used in the matrix */
  recipes: Record<string, AdjustedRecipe>;
  /** Items used in the matrix */
  itemValues: Record<string, ItemValues>;
  /** Recipe limits */
  recipeLimits: Record<string, Rational>;
  /** Items that have no included recipe */
  unproduceableIds: Set<string>;
  /** Items that are explicitly excluded */
  excludedIds: Set<string>;
  /** All items that are included */
  itemIds: string[];
  data: AdjustedDataset;
  maximizeType: MaximizeType;
  requireMachinesOutput: boolean;
  costs: CostSettings;
  hasSurplusCost: boolean;
}

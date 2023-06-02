import { MenuItem } from 'primeng/api';

import { Rational } from './rational';

export interface StepOutput {
  recipeId?: string;
  recipeObjectiveId?: string;
  inputs?: boolean;
  value: Rational;
  machines: Rational;
}

export interface StepDetail {
  tabs: MenuItem[];
  outputs: StepOutput[];
  recipeIds: string[];
  allRecipesIncluded: boolean;
}

import { MenuItem } from 'primeng/api';

import { Rational } from './rational';

export interface StepOutput {
  recipeId: string;
  value: Rational;
  factories: Rational;
}

export interface StepDetail {
  tabs: MenuItem[];
  outputs: StepOutput[];
  recipeIds: string[];
  defaultableRecipeIds: string[];
}

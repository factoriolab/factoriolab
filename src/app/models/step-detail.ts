import { MenuItem } from 'primeng/api';

import { Step } from './step';

export interface StepDetail {
  tabs: MenuItem[];
  outputs: Step[];
  recipeIds: string[];
  defaultableRecipeIds: string[];
}

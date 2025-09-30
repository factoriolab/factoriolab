import { MenuItem } from '~/models/menu-item';
import { Option } from '~/option/option';

import { StepOutput } from './step-output';

export interface StepDetail {
  tabs: MenuItem[];
  outputs: StepOutput[];
  recipeIds: string[];
  recipesEnabled: string[];
  recipeOptions: Option[];
}

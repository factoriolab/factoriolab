import { MenuItem } from '~/models/menu-item';
import { Option } from '~/models/option';

import { StepOutput } from './step-output';

export interface StepDetail {
  tabs: MenuItem[];
  outputs: StepOutput[];
  recipeIds: string[];
  recipesEnabled: string[];
  recipeOptions: Option[];
}

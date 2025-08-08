import { MenuItem } from './menu-item';
import { Option } from './option';
import { StepOutput } from './step-output';

export interface StepDetail {
  tabs: MenuItem[];
  outputs: StepOutput[];
  recipeIds: string[];
  recipesEnabled: string[];
  recipeOptions: Option[];
}

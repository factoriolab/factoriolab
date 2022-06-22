import { StepDetailTab } from './enum';
import { Step } from './step';

export interface StepDetail {
  tabs: StepDetailTab[];
  outputs: Step[];
  recipeIds: string[];
  defaultableRecipeIds: string[];
}

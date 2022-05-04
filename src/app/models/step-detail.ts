import { StepDetailTab } from './enum';
import { Step } from './step';

export interface StepDetail {
  tabs: StepDetailTab[];
  outputs: Step[];
  recipes: string[];
}

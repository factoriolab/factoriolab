import { StepItem } from './step-item';
import { StepRecipe } from './step-recipe';

export interface Step {
  id: string;
  item?: StepItem;
  recipe?: StepRecipe;
}

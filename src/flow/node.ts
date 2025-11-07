import { IconData } from '~/data/schema/icon-data';
import { Recipe } from '~/data/schema/recipe';

import { BaseData } from './base-data';

export interface Node extends BaseData {
  id: string;
  name: string;
  recipe?: Recipe;
  machines?: string;
  machineId?: string;

  stepId: string;
  icon: IconData;
  recipeIcon?: IconData;
  recipeObjectiveId?: string;
}

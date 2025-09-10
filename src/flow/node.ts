import { Recipe } from '~/data/schema/recipe';

import { BaseData } from './base-data';

export interface Node extends BaseData {
  id: string;
  recipe?: Recipe;
  machines?: string;
  machineId?: string;

  stepId: string;
  posX: string;
  posY: string;
  viewBox: string;
  href: string;
}

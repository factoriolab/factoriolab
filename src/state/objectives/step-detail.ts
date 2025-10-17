import { TabData } from '~/components/tabs/tab-data';
import { Option } from '~/option/option';

import { StepDetailTab } from './step-detail-tab';
import { StepOutput } from './step-output';

export interface StepDetail {
  tabs: TabData<StepDetailTab>[];
  outputs: StepOutput[];
  recipeIds: string[];
  recipesEnabled: string[];
  recipeOptions: Option[];
}

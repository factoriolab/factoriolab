import { IconDefinition } from '@fortawesome/angular-fontawesome';

import { InterpolateParams } from '~/translate/translate';

export interface MessageData {
  icon: IconDefinition;
  detail: string;
  summary?: string;
  info?: string;
  params?: InterpolateParams;
  recipeId?: string;
}

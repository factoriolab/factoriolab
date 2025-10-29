import { IconDefinition } from '@fortawesome/angular-fontawesome';

import { TranslateParams } from '~/translate/translate';

export interface MessageData {
  icon: IconDefinition;
  detail: string;
  summary?: string;
  info?: string;
  params?: TranslateParams;
  recipeId?: string;
}

import { IconDefinition } from '@fortawesome/angular-fontawesome';

import { Color } from '~/state/preferences/color';

export interface ConfirmAction<T> {
  text: string;
  value?: T;
  color?: Color;
  icon?: IconDefinition;
}

export interface ConfirmData<T> {
  icon?: IconDefinition;
  header: string;
  message: string;
  actions?: ConfirmAction<T>[];
}

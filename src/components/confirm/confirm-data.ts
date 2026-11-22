import { IconDefinition } from '@fortawesome/angular-fontawesome';

import { IconType } from '~/data/icon-type';
import { Color } from '~/state/preferences/color';

export interface ConfirmAction<T> {
  text: string;
  value?: T;
  color?: Color;
  faIcon?: IconDefinition;
  icon?: string;
  iconType?: IconType;
}

export interface ConfirmData<T> {
  icon?: IconDefinition;
  header: string;
  message: string;
  actions?: ConfirmAction<T>[];
}

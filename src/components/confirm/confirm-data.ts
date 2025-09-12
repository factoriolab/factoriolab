import { IconDefinition } from '@fortawesome/angular-fontawesome';

export interface ConfirmAction<T> {
  text: string;
  value?: T;
  color?: 'brand' | 'gray';
  icon?: IconDefinition;
}

export interface ConfirmData<T> {
  icon?: IconDefinition;
  header: string;
  message: string;
  actions?: ConfirmAction<T>[];
}

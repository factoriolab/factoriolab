import { IconDefinition } from '@fortawesome/angular-fontawesome';

export interface TabData<T = string> {
  label: string;
  value: T;
  icon?: string;
  faIcon?: IconDefinition;
  routerLink?: string;
  command?: () => void;
}

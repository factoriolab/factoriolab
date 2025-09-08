import { IconDefinition } from '@fortawesome/angular-fontawesome';

export interface TabData {
  label: string;
  value: string;
  icon?: string;
  faIcon?: IconDefinition;
  routerLink?: string;
}

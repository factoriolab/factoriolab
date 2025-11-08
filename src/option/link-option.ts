import { IconDefinition } from '@fortawesome/angular-fontawesome';

export interface LinkOption {
  faIcon?: IconDefinition;
  routerLink?: string;
  label: string;
}

import { QueryParamsHandling } from '@angular/router';

export interface MenuItem {
  label?: string;
  icon?: string;
  routerLink?: string;
  queryParamsHandling?: QueryParamsHandling;
}

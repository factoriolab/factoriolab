import { Router } from '@angular/router';

export interface ErrorInfo {
  message?: string;
}

export function getErrorInfo(router: Router): ErrorInfo | undefined {
  return router.currentNavigation()?.extras?.info as ErrorInfo | undefined;
}

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CanActivateFn, Navigation, Router } from '@angular/router';

import { DEFAULT_MOD } from '~/data/datasets';

function getErrorInfo(navigation: Navigation | null): string | undefined {
  return navigation?.extras?.info as string | undefined;
}

export const errorGuard: CanActivateFn = () => {
  const router = inject(Router);
  if (!getErrorInfo(router.currentNavigation()))
    return router.createUrlTree([DEFAULT_MOD]);
  return true;
};

@Component({
  selector: 'lab-error',
  imports: [],
  templateUrl: './error.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Error {}

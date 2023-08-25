import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Store } from '@ngrx/store';
import { first, map } from 'rxjs';

import { LabState, Preferences } from '~/store';
import { BrowserUtility } from '~/utilities';

export const canActivateLanding: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const router = inject(Router);
  return inject(Store<LabState>)
    .select(Preferences.getBypassLanding)
    .pipe(
      first(),
      map((bypassLanding) => {
        if (bypassLanding) {
          if (BrowserUtility.routerState && state.url === '/') {
            // Navigating to root with no query params, use last known state
            return router.parseUrl(BrowserUtility.routerState);
          }

          // Navigate to list, preserving query params from target route
          return router.parseUrl('/list' + state.url.substring(1));
        }

        return true;
      }),
    );
};

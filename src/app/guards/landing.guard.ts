import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { first, map } from 'rxjs';

import { LabState } from '~/store';
import { selectBypassLanding } from '~/store/preferences/preferences.selectors';
import { initialSettingsState } from '~/store/settings/settings.reducer';
import { BrowserUtility } from '~/utilities/browser.utility';

export const canActivateLanding: CanActivateFn = (
  route: ActivatedRouteSnapshot,
) => {
  const router = inject(Router);
  return inject(Store<LabState>)
    .select(selectBypassLanding)
    .pipe(
      first(),
      map((bypassLanding) => {
        if (bypassLanding) {
          if (
            BrowserUtility.routerState &&
            Object.keys(route.queryParams).length === 0
          ) {
            // Navigating to root with no query params, use last known state
            return router.parseUrl(BrowserUtility.routerState);
          }

          // Navigate to list, preserving query params from target route
          const id = route.paramMap.get('id') ?? initialSettingsState.modId;
          return router.createUrlTree([id, 'list'], {
            queryParams: route.queryParams,
          });
        }

        return true;
      }),
    );
};

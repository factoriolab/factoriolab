import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';

import { DEFAULT_MOD } from '~/models/constants';
import { RouterService } from '~/services/router.service';
import { PreferencesService } from '~/store/preferences.service';

export const canActivateLanding: CanActivateFn = (
  route: ActivatedRouteSnapshot,
) => {
  const router = inject(Router);
  const bypassLanding = inject(PreferencesService).bypassLanding();
  if (bypassLanding) {
    const routerState = inject(RouterService).stored();
    // If navigating to root with no query params, use last known state
    if (
      routerState &&
      Object.keys(route.params).length === 0 &&
      Object.keys(route.queryParams).length === 0
    )
      return router.parseUrl(routerState);

    // Navigate to list, preserving query params from target route
    const id = route.paramMap.get('id') ?? DEFAULT_MOD;
    return router.createUrlTree([id, 'list'], {
      queryParams: route.queryParams,
    });
  }

  // If we are at root, redirect to default mod
  if (route.params['id'] == null) return router.createUrlTree([DEFAULT_MOD]);

  return true;
};

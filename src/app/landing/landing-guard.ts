import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { DEFAULT_MOD } from '~/models/datasets';
import { PreferencesStore } from '~/state/preferences/preferences-store';
import { RouterSync } from '~/state/router/router-sync';

export const landingGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const bypassLanding = inject(PreferencesStore).bypassLanding();
  if (bypassLanding) {
    const queryState = inject(RouterSync).stored();
    // If navigating to root with no query params, use last known state
    if (
      queryState &&
      Object.keys(route.params).length === 0 &&
      Object.keys(route.queryParams).length === 0
    )
      return router.parseUrl(queryState);

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

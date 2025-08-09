import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { LabParams } from '~/state/router/lab-params';
import { RouterSync } from '~/state/router/router-sync';

export const ratioGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const routerSync = inject(RouterSync);

  const keys = Object.keys(route.queryParams);

  const queryParams: LabParams = {
    o: keys.map((k) => `${k}*0.5`),
    odr: '0',
    v: routerSync.version,
  };

  return router.createUrlTree(['..', 'list'], { queryParams });
};

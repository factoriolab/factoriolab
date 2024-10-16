import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';

import { LabParams } from '~/models/lab-params';
import { RouterService } from '~/services/router.service';

export const canActivateRatio: CanActivateFn = (
  route: ActivatedRouteSnapshot,
) => {
  const router = inject(Router);
  const routerSvc = inject(RouterService);

  const keys = Object.keys(route.queryParams);

  const queryParams: LabParams = {
    o: keys.map((k) => `${k}*0.5`),
    odr: '0',
    v: routerSvc.version,
  };

  return router.createUrlTree(['..', 'list'], { queryParams });
};

import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { from, map } from 'rxjs';

import { MigrationService, RouterService } from '~/services';

export const canActivateId: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  _: RouterStateSnapshot,
) => {
  const router = inject(Router);
  const migrationSvc = inject(MigrationService);
  const routerSvc = inject(RouterService);
  const id = route.params['id'];

  // Migrate old states
  switch (id) {
    case 'list':
    case 'wizard':
    case 'flow':
    case 'data': {
      return from(routerSvc.unzipQueryParams(route.queryParams)).pipe(
        map((queryParams) => migrationSvc.migrate(undefined, queryParams)),
        map(([modId, queryParams]) =>
          router.createUrlTree([modId, id], { queryParams }),
        ),
      );
    }
    case 'factorio':
      return router.createUrlTree(['1.1']);
    case 'satisfactory':
      return router.createUrlTree(['sfy']);
    case 'techtonica':
      return router.createUrlTree(['tta']);
    case 'final-factory':
      return router.createUrlTree(['ffy']);
  }

  return true;
};

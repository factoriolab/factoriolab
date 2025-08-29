import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { from, map, switchMap } from 'rxjs';

import { DEFAULT_MOD } from '~/data/datasets';
import { Migration } from '~/state/router/migration';
import { RouterSync } from '~/state/router/router-sync';
import { coalesce } from '~/utils/nullish';

export const idGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const migration = inject(Migration);
  const routerSync = inject(RouterSync);

  const id = route.params['id'] as string | undefined;

  // Migrate old states
  switch (id) {
    case 'list':
    case 'wizard':
    case 'flow':
    case 'data': {
      return from(routerSync.unzipQueryParams(route.queryParams)).pipe(
        map((queryParams) => migration.migrate(undefined, queryParams)),
        switchMap(async ({ modId, params }) => {
          if (params.z) params = await routerSync.getHashParams(params);
          return router.createUrlTree([coalesce(modId, '1.1'), id], {
            queryParams: params,
          });
        }),
      );
    }
    case 'factorio':
      return router.createUrlTree([DEFAULT_MOD]);
    case 'final-factory':
      return router.createUrlTree(['ffy']);
    case 'foundry':
      return router.createUrlTree(['fdy']);
    case 'outworld-station':
      return router.createUrlTree(['ows']);
    case 'satisfactory':
      return router.createUrlTree(['sfy']);
    case 'techtonica':
      return router.createUrlTree(['tta']);
  }

  routerSync.route$.next(route);

  return true;
};

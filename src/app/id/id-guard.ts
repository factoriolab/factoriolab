import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';

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
      const result = async (): Promise<UrlTree> => {
        const unzipParams = await routerSync.unzipQueryParams(
          route.queryParams,
        );
        const { modId, params } = migration.migrate(undefined, unzipParams);
        const queryParams = params.z
          ? await routerSync.getHashParams(params)
          : params;
        return router.createUrlTree([coalesce(modId, '1.1'), id], {
          queryParams,
        });
      };
      return result();
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

  return true;
};

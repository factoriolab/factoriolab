import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { from, map } from 'rxjs';

import { coalesce } from '~/helpers';
import { MigrationService } from '~/services/migration.service';
import { RouterService } from '~/services/router.service';
import { initialSettingsState } from '~/store/settings/settings.reducer';

export const canActivateId: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  _: RouterStateSnapshot,
) => {
  const router = inject(Router);
  const migrationSvc = inject(MigrationService);
  const routerSvc = inject(RouterService);
  const id = route.params['id'] as string | undefined;

  // Migrate old states
  switch (id) {
    case 'list':
    case 'wizard':
    case 'flow':
    case 'data': {
      return from(routerSvc.unzipQueryParams(route.queryParams)).pipe(
        map((queryParams) => migrationSvc.migrate(undefined, queryParams)),
        map(({ modId, params }) =>
          router.createUrlTree(
            [coalesce(modId, initialSettingsState.modId), id],
            {
              queryParams: params,
            },
          ),
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

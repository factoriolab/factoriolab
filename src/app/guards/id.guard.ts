import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';

const old = new Set(['list', 'wizard', 'flow', 'data']);
export const canActivateId: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  _: RouterStateSnapshot,
) => {
  const router = inject(Router);
  const id = route.params['id'];

  // Migrate old states
  switch (id) {
    case 'list':
    case 'wizard':
    case 'flow':
    case 'data':
      // TODO: Migrate old states
      console.log('old route', id, route, _);
      break;
    case 'factorio':
      return router.createUrlTree(['1.1']);
    case 'satisfactory':
      return router.createUrlTree(['sfy']);
    case 'techtonica':
      return router.createUrlTree(['tta']);
    case 'final-factory':
      return router.createUrlTree(['ffy']);
  }

  if (old.has(id)) {
    // TODO: Migrate old states
    console.log('old route', id, route, _);
    return inject(Router).createUrlTree(['']);
  }
  return true;
};

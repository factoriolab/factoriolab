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
  const id = route.params['id'];
  // TODO: Migrate old states
  if (old.has(id)) return inject(Router).createUrlTree(['']);
  return true;
};

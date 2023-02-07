import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Store } from '@ngrx/store';
import { map, Observable } from 'rxjs';

import { LabState, Preferences } from '~/store';
import { BrowserUtility } from '~/utilities';

@Injectable({
  providedIn: 'root',
})
export class LandingGuard implements CanActivate {
  constructor(private router: Router, private store: Store<LabState>) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return this.store.select(Preferences.getBypassLanding).pipe(
      map((bypassLanding) => {
        if (bypassLanding) {
          if (BrowserUtility.routerState && state.url === '/') {
            // Navigating to root with no query params, use last known state
            return this.router.parseUrl(BrowserUtility.routerState);
          }

          // Navigate to list, preserving query params from target route
          return this.router.parseUrl('/list' + state.url.substring(1));
        }

        return true;
      })
    );
  }
}

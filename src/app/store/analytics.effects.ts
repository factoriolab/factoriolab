import { Injectable } from '@angular/core';
import { Actions, createEffect } from '@ngrx/effects';
import { GoogleAnalyticsService } from 'ngx-google-analytics';
import { tap } from 'rxjs';

@Injectable()
export class AnalyticsEffects {
  logEvent$ = createEffect(
    () =>
      this.actions$.pipe(
        tap((action) => {
          this.gaSvc.event('action', action.type);
        })
      ),
    { dispatch: false }
  );

  constructor(
    private gaSvc: GoogleAnalyticsService,
    private actions$: Actions
  ) {}
}

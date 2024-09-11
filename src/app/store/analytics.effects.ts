import { inject, Injectable } from '@angular/core';
import { Actions, createEffect } from '@ngrx/effects';
import { tap } from 'rxjs';

import { AnalyticsService } from '~/services';

@Injectable()
export class AnalyticsEffects {
  analyticsSvc = inject(AnalyticsService);
  actions$ = inject<Actions>(Actions);

  logEvent$ = createEffect(
    () => {
      return this.actions$.pipe(
        tap((action) => {
          this.analyticsSvc.event('action', action.type);
        }),
      );
    },
    { dispatch: false },
  );
}

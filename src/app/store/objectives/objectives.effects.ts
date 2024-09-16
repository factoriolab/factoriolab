import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map } from 'rxjs/operators';

import { displayRateInfo } from '~/models/enum/display-rate';

import { setDisplayRate } from '../settings/settings.actions';
import { adjustDisplayRate } from './objectives.actions';

@Injectable()
export class ObjectivesEffects {
  actions$ = inject(Actions);

  adjustDisplayRate$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(setDisplayRate),
      map(({ displayRate, previous }) => {
        const factor = displayRateInfo[displayRate].value.div(
          displayRateInfo[previous].value,
        );
        return adjustDisplayRate({ factor });
      }),
    );
  });
}

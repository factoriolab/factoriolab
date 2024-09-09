import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map } from 'rxjs/operators';

import { displayRateInfo } from '~/models';

import * as Settings from '../settings';
import * as ObjectivesActions from './objectives.actions';

@Injectable()
export class ObjectivesEffects {
  actions$ = inject(Actions);

  adjustDisplayRate$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(Settings.setDisplayRate),
      map(({ displayRate, previous }) => {
        const factor = displayRateInfo[displayRate].value.div(
          displayRateInfo[previous].value,
        );
        return ObjectivesActions.adjustDisplayRate({ factor });
      }),
    );
  });
}

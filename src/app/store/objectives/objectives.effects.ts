import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map } from 'rxjs/operators';

import { displayRateInfo } from '~/models';
import * as Settings from '../settings';
import { AdjustDisplayRateAction } from './objectives.actions';

@Injectable()
export class ObjectivesEffects {
  adjustDisplayRate$ = createEffect(() =>
    this.actions$.pipe(
      ofType(Settings.SettingsActionType.SET_DISPLAY_RATE),
      map((a: Settings.SetDisplayRateAction) => {
        const factor = displayRateInfo[a.payload.value].value.div(
          displayRateInfo[a.payload.prev].value
        );
        return new AdjustDisplayRateAction(factor.toString());
      })
    )
  );

  constructor(private actions$: Actions) {}
}

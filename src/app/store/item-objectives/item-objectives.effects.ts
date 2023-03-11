import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map } from 'rxjs/operators';

import { displayRateInf } from '~/models';
import * as Settings from '../settings';
import { AdjustDisplayRateAction } from './item-objectives.actions';

@Injectable()
export class ItemsObjEffects {
  adjustDisplayRate$ = createEffect(() =>
    this.actions$.pipe(
      ofType(Settings.SettingsActionType.SET_DISPLAY_RATE),
      map((a: Settings.SetDisplayRateAction) => {
        const factor = displayRateInf[a.payload.value].value.div(
          displayRateInf[a.payload.prev].value
        );
        return new AdjustDisplayRateAction(factor.toString());
      })
    )
  );

  constructor(private actions$: Actions) {}
}

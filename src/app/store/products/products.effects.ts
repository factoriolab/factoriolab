import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map } from 'rxjs/operators';

import { DisplayRateVal } from '~/models';
import * as Settings from '../settings';
import { AdjustDisplayRateAction } from './products.actions';

@Injectable()
export class ProductsEffects {
  adjustDisplayRate$ = createEffect(() =>
    this.actions$.pipe(
      ofType(Settings.SettingsActionType.SET_DISPLAY_RATE),
      map((a: Settings.SetDisplayRateAction) => {
        const factor = DisplayRateVal[a.payload.value].div(
          DisplayRateVal[a.payload.prev]
        );
        return new AdjustDisplayRateAction(factor.toString());
      })
    )
  );

  constructor(private actions$: Actions) {}
}

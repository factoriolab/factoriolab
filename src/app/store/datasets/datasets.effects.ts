import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { filter, map, switchMap } from 'rxjs/operators';

import { DataService } from '~/services';
import * as App from '../app.actions';
import * as Products from '../products';
import * as Settings from '../settings';

@Injectable()
export class DatasetsEffects {
  appLoad$ = createEffect(() =>
    this.actions$.pipe(
      ofType(App.AppActionType.LOAD),
      switchMap((a: App.LoadAction) => {
        const id =
          a.payload.settingsState?.modId || Settings.initialSettingsState.modId;
        return this.dataSvc.requestData(id).pipe(
          filter(() => !a.payload.productsState),
          map(([data]) => new Products.ResetAction(data.items[0].id))
        );
      })
    )
  );

  appReset$ = createEffect(() =>
    this.actions$.pipe(
      ofType(App.AppActionType.RESET),
      switchMap(() =>
        this.dataSvc
          .requestData(Settings.initialSettingsState.modId)
          .pipe(map(([data]) => new Products.ResetAction(data.items[0].id)))
      )
    )
  );

  setModId$ = createEffect(() =>
    this.actions$.pipe(
      ofType(Settings.SettingsActionType.SET_MOD),
      switchMap((a: Settings.SetModAction) =>
        this.dataSvc
          .requestData(a.payload)
          .pipe(map(([data]) => new Products.ResetAction(data.items[0].id)))
      )
    )
  );

  constructor(private actions$: Actions, private dataSvc: DataService) {}
}

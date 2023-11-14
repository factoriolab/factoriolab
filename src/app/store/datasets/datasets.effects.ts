import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap } from 'rxjs/operators';

import { DataService } from '~/services';
import * as App from '../app.actions';
import * as Settings from '../settings';

@Injectable()
export class DatasetsEffects {
  actions$ = inject(Actions);
  dataSvc = inject(DataService);

  appLoad$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(App.AppActionType.LOAD),
        switchMap((a: App.LoadAction) => {
          const id =
            a.payload.settingsState?.modId ||
            Settings.initialSettingsState.modId;
          return this.dataSvc.requestData(id);
        }),
      ),
    { dispatch: false },
  );

  appReset$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(App.AppActionType.RESET),
        switchMap(() =>
          this.dataSvc.requestData(Settings.initialSettingsState.modId),
        ),
      ),
    { dispatch: false },
  );

  setModId$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(Settings.SettingsActionType.SET_MOD),
        switchMap((a: Settings.SetModAction) =>
          this.dataSvc.requestData(a.payload),
        ),
      ),
    { dispatch: false },
  );
}

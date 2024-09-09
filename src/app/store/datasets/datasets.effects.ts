import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap } from 'rxjs/operators';

import { DataService } from '~/services';

import * as App from '../app.actions';
import * as Settings from '../settings';

@Injectable()
export class DatasetsEffects {
  actions$ = inject(Actions);
  dataSvc = inject(DataService);

  appLoad$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(App.load),
        map(
          ({ partial }) =>
            partial.settingsState?.modId || Settings.initialState.modId,
        ),
        switchMap((id) => this.dataSvc.requestData(id)),
      );
    },
    { dispatch: false },
  );

  appReset$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(App.reset),
        switchMap(() => this.dataSvc.requestData(Settings.initialState.modId)),
      );
    },
    { dispatch: false },
  );

  setModId$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(Settings.setMod),
        switchMap(({ modId }) => this.dataSvc.requestData(modId)),
      );
    },
    { dispatch: false },
  );
}

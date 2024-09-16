import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap } from 'rxjs/operators';

import { DataService } from '~/services/data.service';

import { load, reset } from '../app.actions';
import { setMod } from '../settings/settings.actions';
import { initialSettingsState } from '../settings/settings.reducer';

@Injectable()
export class DatasetsEffects {
  actions$ = inject(Actions);
  dataSvc = inject(DataService);

  appLoad$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(load),
        map(
          ({ partial }) =>
            partial.settingsState?.modId || initialSettingsState.modId,
        ),
        switchMap((id) => this.dataSvc.requestData(id)),
      );
    },
    { dispatch: false },
  );

  appReset$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(reset),
        switchMap(() => this.dataSvc.requestData(initialSettingsState.modId)),
      );
    },
    { dispatch: false },
  );

  setModId$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(setMod),
        switchMap(({ modId }) => this.dataSvc.requestData(modId)),
      );
    },
    { dispatch: false },
  );
}

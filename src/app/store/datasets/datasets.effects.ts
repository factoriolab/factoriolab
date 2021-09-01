import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { switchMap, map, tap } from 'rxjs/operators';

import { ModData, Entities } from '~/models';
import { BrowserUtility } from '~/utilities';
import { State } from '..';
import * as App from '../app.actions';
import { ResetAction } from '../products';
import * as Settings from '../settings';
import { LoadModAction } from './datasets.actions';

@Injectable()
export class DatasetsEffects {
  cache: Entities<ModData> = {};

  appLoad$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(App.AppActionType.LOAD),
        switchMap((a: App.LoadAction) => {
          const id =
            a.payload.settingsState?.baseId ||
            Settings.initialSettingsState.baseId;
          return this.requestData(id).pipe(
            tap((value) => this.loadModsForBase(value.defaults.modIds)),
            tap((value) => {
              if (!a.payload.productsState) {
                this.store.dispatch(new ResetAction(value.items[0].id));
              }
            })
          );
        })
      ),
    { dispatch: false }
  );

  appReset$ = createEffect(() =>
    this.actions$.pipe(
      ofType(App.AppActionType.RESET),
      switchMap(() =>
        this.requestData(Settings.initialSettingsState.baseId).pipe(
          tap((value) => this.loadModsForBase(value.defaults.modIds)),
          map((value) => new ResetAction(value.items[0].id))
        )
      )
    )
  );

  setBaseId$ = createEffect(() =>
    this.actions$.pipe(
      ofType(Settings.SettingsActionType.SET_BASE),
      switchMap((a: Settings.SetBaseAction) =>
        this.requestData(a.payload).pipe(
          tap((value) => this.loadModsForBase(value.defaults.modIds)),
          map((value) => new ResetAction(value.items[0].id))
        )
      )
    )
  );

  loadModsForBase(modIds: string[]): void {
    modIds.forEach((id) => this.requestData(id).subscribe(() => {}));
  }

  requestData(id: string): Observable<ModData> {
    return this.cache[id]
      ? of(this.cache[id])
      : this.http.get(`data/${id}/data.json`).pipe(
          map((response) => response as ModData),
          tap((data) => (this.cache[id] = data)),
          tap((value) => this.store.dispatch(new LoadModAction({ id, value })))
        );
  }

  load(zip: string, stored: State, initial: Settings.SettingsState): void {
    if (!zip) {
      const id = stored?.settingsState?.baseId || initial.baseId;
      this.requestData(id).subscribe((value) => {
        this.loadModsForBase(value.defaults.modIds);
        if (!stored?.productsState) {
          this.store.dispatch(new ResetAction(value.items[0].id));
        }
      });
    }
  }

  constructor(
    private actions$: Actions,
    private http: HttpClient,
    private store: Store<State>
  ) {
    this.load(
      BrowserUtility.zip,
      BrowserUtility.storedState,
      Settings.initialSettingsState
    );
  }
}

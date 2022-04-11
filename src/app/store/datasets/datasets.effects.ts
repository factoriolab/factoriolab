import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { combineLatest, EMPTY, Observable, of } from 'rxjs';
import { switchMap, map, tap } from 'rxjs/operators';

import { ModData, Entities, ModHash } from '~/models';
import { BrowserUtility } from '~/utilities';
import { LabState } from '..';
import * as App from '../app.actions';
import * as Products from '../products';
import * as Settings from '../settings';
import { LoadModDataAction, LoadModHashAction } from './datasets.actions';

@Injectable()
export class DatasetsEffects {
  cacheData: Entities<ModData> = {};
  cacheHash: Entities<ModHash> = {};

  appLoad$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(App.AppActionType.LOAD),
        switchMap((a: App.LoadAction) => {
          const id =
            a.payload.settingsState?.baseId ||
            Settings.initialSettingsState.baseId;
          return this.requestData(id).pipe(
            tap(([data, hash]) => this.loadModsForBase(data.defaults.modIds)),
            tap(([data, hash]) => {
              if (!a.payload.productsState) {
                this.store.dispatch(new Products.ResetAction(data.items[0].id));
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
          tap(([data, hash]) => this.loadModsForBase(data.defaults.modIds)),
          map(([data, hash]) => new Products.ResetAction(data.items[0].id))
        )
      )
    )
  );

  setBaseId$ = createEffect(() =>
    this.actions$.pipe(
      ofType(Settings.SettingsActionType.SET_BASE),
      switchMap((a: Settings.SetBaseAction) =>
        this.requestData(a.payload).pipe(
          tap(([data, hash]) => this.loadModsForBase(data.defaults.modIds)),
          map(([data, hash]) => new Products.ResetAction(data.items[0].id))
        )
      )
    )
  );

  loadModsForBase(modIds: string[]): void {
    modIds.forEach((id) => this.requestData(id, false).subscribe(() => {}));
  }

  requestData(id: string, hash = true): Observable<[ModData, ModHash]> {
    const data$ = this.cacheData[id]
      ? of(this.cacheData[id])
      : this.http.get(`data/${id}/data.json`).pipe(
          map((response) => response as ModData),
          tap((data) => (this.cacheData[id] = data)),
          tap((value) =>
            this.store.dispatch(new LoadModDataAction({ id, value }))
          )
        );
    const hash$ = hash
      ? this.cacheHash[id]
        ? of(this.cacheHash[id])
        : this.http.get(`data/${id}/hash.json`).pipe(
            map((response) => response as ModHash),
            tap((data) => (this.cacheHash[id] = data)),
            tap((value) =>
              this.store.dispatch(new LoadModHashAction({ id, value }))
            )
          )
      : EMPTY;
    return combineLatest([data$, hash$]);
  }

  load(zip: string, stored: LabState, initial: Settings.SettingsState): void {
    if (!zip) {
      const id = stored?.settingsState?.baseId || initial.baseId;
      this.requestData(id).subscribe(([data, hash]) => {
        this.loadModsForBase(data.defaults.modIds);
        if (!stored?.productsState) {
          this.store.dispatch(new Products.ResetAction(data.items[0].id));
        }
      });
    }
  }

  constructor(
    private actions$: Actions,
    private http: HttpClient,
    private store: Store<LabState>
  ) {
    this.load(
      BrowserUtility.zip,
      BrowserUtility.storedState,
      Settings.initialSettingsState
    );
  }
}

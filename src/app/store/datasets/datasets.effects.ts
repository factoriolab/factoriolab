import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { combineLatest, EMPTY, Observable, of } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';

import { Entities, ModData, ModHash } from '~/models';
import { BrowserUtility } from '~/utilities';
import { LabState } from '../';
import * as App from '../app.actions';
import * as Products from '../products';
import * as Settings from '../settings';
import { LoadModDataAction, LoadModHashAction } from './datasets.actions';

@Injectable()
export class DatasetsEffects {
  cacheData: Entities<ModData> = {};
  cacheHash: Entities<ModHash> = {};

  appLoad$ = createEffect(() =>
    this.actions$.pipe(
      ofType(App.AppActionType.LOAD),
      switchMap((a: App.LoadAction) => {
        const id =
          a.payload.settingsState?.baseId ||
          Settings.initialSettingsState.baseId;
        return this.requestData(id).pipe(
          filter(([data, hash]) => !a.payload.productsState),
          map(([data, hash]) => new Products.ResetAction(data.items[0].id))
        );
      })
    )
  );

  appReset$ = createEffect(() =>
    this.actions$.pipe(
      ofType(App.AppActionType.RESET),
      switchMap(() =>
        this.requestData(Settings.initialSettingsState.baseId).pipe(
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
          map(([data, hash]) => new Products.ResetAction(data.items[0].id))
        )
      )
    )
  );

  requestData(id: string, skipHash = false): Observable<[ModData, ModHash]> {
    const data$ = this.cacheData[id]
      ? of(this.cacheData[id])
      : this.http.get(`data/${id}/data.json`).pipe(
          map((response) => response as ModData),
          tap((value) => {
            this.cacheData[id] = value;
            this.store.dispatch(new LoadModDataAction({ id, value }));
            this.loadModsForBase(value.defaults?.modIds ?? []);
          })
        );
    const hash$ = skipHash
      ? EMPTY
      : this.cacheHash[id]
      ? of(this.cacheHash[id])
      : this.http.get(`data/${id}/hash.json`).pipe(
          map((response) => response as ModHash),
          tap((value) => {
            this.cacheHash[id] = value;
            this.store.dispatch(new LoadModHashAction({ id, value }));
          })
        );
    return combineLatest([data$, hash$]);
  }

  loadModsForBase(modIds: string[]): void {
    modIds.forEach((id) => this.requestData(id, false).subscribe(() => {}));
  }

  load(
    zip: string,
    stored: Partial<LabState> | null,
    initial: Settings.SettingsState
  ): void {
    if (!zip) {
      const id = stored?.settingsState?.baseId || initial.baseId;
      this.requestData(id).subscribe(([data, hash]) => {
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

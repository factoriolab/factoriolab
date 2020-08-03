import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { of, forkJoin } from 'rxjs';
import { switchMap, map, tap } from 'rxjs/operators';

import { ModData, Entities } from '~/models';
import { State } from '..';
import { AppActionType, AppLoadAction } from '../app.actions';
import { AddAction, ResetAction } from '../products';
import * as Settings from '../settings';
import { LoadModAction, DatasetsActionType } from './datasets.actions';

@Injectable()
export class DatasetsEffects {
  cache: Entities<ModData> = {};

  @Effect({ dispatch: false })
  loadMod$ = this.actions$.pipe(
    ofType(DatasetsActionType.LOAD_MOD),
    tap((a: LoadModAction) => (this.cache[a.payload.id] = a.payload.value))
  );

  @Effect()
  appLoad$ = this.actions$.pipe(
    ofType(AppActionType.LOAD),
    switchMap((a: AppLoadAction) => {
      const id =
        a.payload.settingsState?.baseDatasetId ||
        Settings.initialSettingsState.baseDatasetId;
      return this.http.get(`data/${id}/data.json`).pipe(
        map((response) => response as ModData),
        switchMap((value) => {
          const actions: Action[] = [
            new Settings.SetDefaultsAction(value.defaults),
            new LoadModAction({ id, value }),
          ];
          if (!a.payload.productsState) {
            actions.push(new AddAction(value.items[0].id));
          }
          return actions;
        })
      );
    })
  );

  @Effect()
  setBaseId$ = this.actions$.pipe(
    ofType(Settings.SettingsActionType.SET_BASE),
    switchMap((a: Settings.SetBaseAction) =>
      this.cache[a.payload]
        ? of(new Settings.SetDefaultsAction(this.cache[a.payload].defaults))
        : this.http.get(`data/${a.payload}/data.json`).pipe(
            map((response) => response as ModData),
            switchMap((value) => [
              new ResetAction(),
              new Settings.SetDefaultsAction(value.defaults),
              new LoadModAction({ id: a.payload, value }),
              new AddAction(value.items[0].id),
            ])
          )
    )
  );

  @Effect()
  setDefaults$ = this.actions$.pipe(
    ofType(Settings.SettingsActionType.SET_DEFAULTS),
    switchMap((a: Settings.SetDefaultsAction) =>
      forkJoin(
        a.payload.modIds
          .filter((id) => !this.cache[id])
          .map((id) =>
            this.http.get(`data/${id}/data.json`).pipe(
              map((response) => response as ModData),
              map((value) => new LoadModAction({ id, value }))
            )
          )
      ).pipe(switchMap((d) => d))
    )
  );

  constructor(
    private actions$: Actions,
    private http: HttpClient,
    private store: Store<State>
  ) {
    if (!location.hash) {
      const id = Settings.initialSettingsState.baseDatasetId;
      this.http
        .get(`data/${id}/data.json`)
        .pipe(map((response) => response as ModData))
        .subscribe((value) => {
          this.store.dispatch(new Settings.SetDefaultsAction(value.defaults));
          this.store.dispatch(new LoadModAction({ id, value }));
          this.store.dispatch(new AddAction(value.items[0].id));
        });
    }
  }
}

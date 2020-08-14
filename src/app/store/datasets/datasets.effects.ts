import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { switchMap, map, tap } from 'rxjs/operators';

import { ModData, Entities } from '~/models';
import { RouterService } from '~/services/router.service';
import { State } from '..';
import { AppActionType, AppLoadAction } from '../app.actions';
import { ResetAction } from '../products';
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
        a.payload.settingsState?.baseId || Settings.initialSettingsState.baseId;
      return this.requestData(id).pipe(
        tap((value) =>
          this.loadModsForBase(
            a.payload.settingsState?.modIds || value.defaults.modIds
          )
        ),
        tap((value) => {
          if (!a.payload.productsState) {
            this.router.unzipping = true;
            this.store.dispatch(new ResetAction(value.items[0].id));
            this.router.unzipping = false;
          }
        }),
        map((value) => new LoadModAction({ id, value }))
      );
    })
  );

  @Effect()
  setBaseId$ = this.actions$.pipe(
    ofType(Settings.SettingsActionType.SET_BASE),
    switchMap((a: Settings.SetBaseAction) =>
      this.cache[a.payload]
        ? [new ResetAction(this.cache[a.payload].items[0].id)]
        : this.requestData(a.payload).pipe(
            tap((value) => this.loadModsForBase(value.defaults.modIds)),
            switchMap((value) => [
              new ResetAction(value.items[0].id),
              new LoadModAction({ id: a.payload, value }),
            ])
          )
    )
  );

  loadModsForBase(modIds: string[]) {
    for (const id of modIds.filter((m) => !this.cache[m])) {
      this.requestData(id).subscribe((value) => {
        this.store.dispatch(new LoadModAction({ id, value }));
      });
    }
  }

  requestData(id: string) {
    return this.http
      .get(`data/${id}/data.json`)
      .pipe(map((response) => response as ModData));
  }

  constructor(
    private actions$: Actions,
    private http: HttpClient,
    private store: Store<State>,
    private router: RouterService
  ) {
    if (!location.hash) {
      const id = Settings.initialSettingsState.baseId;
      this.requestData(id).subscribe((value) => {
        this.router.unzipping = true;
        this.loadModsForBase(value.defaults.modIds);
        this.store.dispatch(new ResetAction(value.items[0].id));
        this.store.dispatch(new LoadModAction({ id, value }));
        this.router.unzipping = false;
      });
    }
  }
}

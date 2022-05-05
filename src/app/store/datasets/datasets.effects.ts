import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, Observable, of } from 'rxjs';
import { catchError, filter, map, switchMap, tap } from 'rxjs/operators';

import { Entities, ModData, ModHash, ModI18n } from '~/models';
import { BrowserUtility } from '~/utilities';
import { LabState } from '../';
import * as App from '../app.actions';
import * as Products from '../products';
import * as Settings from '../settings';
import {
  LoadModDataAction,
  LoadModHashAction,
  LoadModI18nAction,
} from './datasets.actions';

@Injectable()
export class DatasetsEffects {
  cacheData: Entities<ModData> = {};
  cacheI18n: Entities<ModI18n> = {};
  cacheHash: Entities<ModHash> = {};

  appLoad$ = createEffect(() =>
    this.actions$.pipe(
      ofType(App.AppActionType.LOAD),
      switchMap((a: App.LoadAction) => {
        const id =
          a.payload.settingsState?.baseId ||
          Settings.initialSettingsState.baseId;
        return this.requestData(id).pipe(
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
        this.requestData(Settings.initialSettingsState.baseId).pipe(
          map(([data]) => new Products.ResetAction(data.items[0].id))
        )
      )
    )
  );

  setBaseId$ = createEffect(() =>
    this.actions$.pipe(
      ofType(Settings.SettingsActionType.SET_BASE),
      switchMap((a: Settings.SetBaseAction) =>
        this.requestData(a.payload).pipe(
          map(([data]) => new Products.ResetAction(data.items[0].id))
        )
      )
    )
  );

  requestData(
    id: string,
    skipHash = false
  ): Observable<[ModData, ModI18n | null, ModHash | null]> {
    const data$ = this.cacheData[id]
      ? of(this.cacheData[id])
      : this.http.get<ModData>(`data/${id}/data.json`).pipe(
          tap((value) => {
            this.cacheData[id] = value;
            this.store.dispatch(new LoadModDataAction({ id, value }));
            this.loadModsForBase(value.defaults?.modIds ?? []);
          })
        );

    const i18nLang = this.translateSvc.currentLang ?? 'en';
    const i18nKey = `${id}-${i18nLang}`;
    const skipI18n = i18nLang === 'en';
    const i18n$ = skipI18n
      ? of(null)
      : this.cacheI18n[i18nKey]
      ? of(this.cacheI18n[i18nKey])
      : this.http.get<ModI18n>(`data/${id}/i18n/${i18nLang}.json`).pipe(
          catchError(() => {
            console.warn(`No localization file found for ${i18nKey}`);
            return of(null);
          }),
          tap((value) => {
            if (value) {
              this.cacheI18n[i18nKey] = value;
              this.store.dispatch(
                new LoadModI18nAction({ id: i18nKey, value })
              );
            }
          })
        );
    const hash$ = skipHash
      ? of(null)
      : this.cacheHash[id]
      ? of(this.cacheHash[id])
      : this.http.get<ModHash>(`data/${id}/hash.json`).pipe(
          tap((value) => {
            this.cacheHash[id] = value;
            this.store.dispatch(new LoadModHashAction({ id, value }));
          })
        );

    return combineLatest([data$, i18n$, hash$]);
  }

  loadModsForBase(modIds: string[]): void {
    modIds.forEach((id) => this.requestData(id, true).subscribe(() => {}));
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
    private store: Store<LabState>,
    private translateSvc: TranslateService
  ) {
    this.load(
      BrowserUtility.zip,
      BrowserUtility.storedState,
      Settings.initialSettingsState
    );
    combineLatest([
      this.store.select(Settings.getBaseDatasetId),
      this.translateSvc.onLangChange,
    ]).subscribe(([id]) => {
      this.requestData(id).subscribe();
    });
  }
}

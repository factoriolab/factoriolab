import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import {
  catchError,
  combineLatest,
  Observable,
  of,
  shareReplay,
  skip,
  tap,
} from 'rxjs';

import { Entities, ModData, ModHash, ModI18n } from '~/models';
import { LabState } from '~/store';
import * as Datasets from '~/store/datasets';
import * as Products from '~/store/products';
import * as Settings from '~/store/settings';
import { BrowserUtility } from '~/utilities';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  cacheData: Entities<Observable<ModData>> = {};
  cacheHash: Entities<Observable<ModHash>> = {};
  cacheI18n: Entities<Observable<ModI18n | null>> = {};

  constructor(
    private http: HttpClient,
    private store: Store<LabState>,
    private translateSvc: TranslateService
  ) {
    this.initialize(
      BrowserUtility.zip,
      BrowserUtility.storedState,
      Settings.initialSettingsState
    );
    combineLatest([
      this.store.select(Settings.getModId),
      this.translateSvc.onLangChange,
    ])
      .pipe(skip(1))
      .subscribe(([id]) => {
        this.requestData(id).subscribe();
      });
  }

  initialize(
    zip: string,
    stored: Partial<LabState> | null,
    initial: Settings.SettingsState
  ): void {
    if (!zip) {
      const id = stored?.settingsState?.modId || initial.modId;
      this.requestData(id).subscribe(([data]) => {
        if (!stored?.productsState) {
          this.store.dispatch(new Products.ResetAction(data.items[0].id));
        }
      });
    }
  }

  requestData(id: string): Observable<[ModData, ModHash, ModI18n | null]> {
    const payload: Datasets.DatasetPayload = {
      data: null,
      hash: null,
      i18n: null,
    };

    /** Setup observable for data */
    if (!this.cacheData[id]) {
      this.cacheData[id] = this.http.get<ModData>(`data/${id}/data.json`).pipe(
        tap((value) => {
          payload.data = { id, value };
        }),
        shareReplay()
      );
    }
    const data$ = this.cacheData[id];

    /** Setup observable for hash */
    if (!this.cacheHash[id]) {
      this.cacheHash[id] = this.http.get<ModHash>(`data/${id}/hash.json`).pipe(
        tap((value) => {
          payload.hash = { id, value };
        }),
        shareReplay()
      );
    }
    const hash$ = this.cacheHash[id];

    /** Setup observable for i18n */
    const i18nLang = this.translateSvc.currentLang ?? 'en';
    const i18nKey = `${id}-${i18nLang}`;
    const skipI18n = i18nLang === 'en';
    let i18n$: Observable<ModI18n | null>;
    if (skipI18n) {
      i18n$ = of(null);
    } else {
      if (!this.cacheI18n[i18nKey]) {
        this.cacheI18n[i18nKey] = this.http
          .get<ModI18n>(`data/${id}/i18n/${i18nLang}.json`)
          .pipe(
            catchError(() => {
              console.warn(`No localization file found for ${i18nKey}`);
              return of(null);
            }),
            tap((value) => {
              if (value) {
                payload.i18n = { id: i18nKey, value };
              }
            }),
            shareReplay()
          );
      }
      i18n$ = this.cacheI18n[i18nKey];
    }

    return combineLatest([data$, hash$, i18n$]).pipe(
      tap(() => {
        if (payload.data || payload.hash || payload.i18n) {
          this.store.dispatch(new Datasets.LoadModAction(payload));
        }
      })
    );
  }
}

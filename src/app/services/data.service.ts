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
  cacheI18n: Entities<Observable<ModI18n | null>> = {};
  cacheHash: Entities<Observable<ModHash>> = {};

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
      this.store.select(Settings.getBaseDatasetId),
      this.translateSvc.onLangChange,
    ]).subscribe(([id]) => {
      this.requestData(id).subscribe();
    });
  }

  initialize(
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

  requestData(
    id: string,
    skipHash = false
  ): Observable<[ModData, ModI18n | null, ModHash | null]> {
    /** Setup observable for data */
    if (!this.cacheData[id]) {
      this.cacheData[id] = this.http.get<ModData>(`data/${id}/data.json`).pipe(
        tap((value) => {
          this.store.dispatch(new Datasets.LoadModDataAction({ id, value }));
          this.loadModsForBase(value.defaults?.modIds ?? []);
        }),
        shareReplay()
      );
    }
    const data$ = this.cacheData[id];

    /** Setup observable for i18n */
    const i18nLang = this.translateSvc.currentLang ?? 'en';
    const i18nKey = `${id}-${i18nLang}`;
    const skipI18n = i18nLang === 'en';
    let i18n$: Observable<ModI18n | null>;
    if (skipI18n) {
      i18n$ = of(null);
    } else {
      if (!this.cacheI18n[id]) {
        this.cacheI18n[id] = this.http
          .get<ModI18n>(`data/${id}/i18n/${i18nLang}.json`)
          .pipe(
            catchError(() => {
              console.warn(`No localization file found for ${i18nKey}`);
              return of(null);
            }),
            tap((value) => {
              if (value) {
                this.store.dispatch(
                  new Datasets.LoadModI18nAction({ id: i18nKey, value })
                );
              }
            }),
            shareReplay()
          );
      }
      i18n$ = this.cacheI18n[id];
    }

    /** Setup observable for hash */
    let hash$: Observable<ModHash | null>;
    if (skipHash) {
      hash$ = of(null);
    } else {
      if (!this.cacheHash[id]) {
        this.cacheHash[id] = this.http
          .get<ModHash>(`data/${id}/hash.json`)
          .pipe(
            tap((value) => {
              this.store.dispatch(
                new Datasets.LoadModHashAction({ id, value })
              );
            }),
            shareReplay()
          );
      }
      hash$ = this.cacheHash[id];
    }

    return combineLatest([data$, i18n$, hash$]);
  }

  loadModsForBase(modIds: string[]): void {
    modIds.forEach((id) => this.requestData(id, true).subscribe(() => {}));
  }
}

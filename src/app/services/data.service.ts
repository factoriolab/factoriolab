import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import {
  catchError,
  combineLatest,
  Observable,
  of,
  shareReplay,
  startWith,
  tap,
} from 'rxjs';

import { Entities, ModData, ModHash, ModI18n } from '~/models';
import { Datasets, LabState, Settings } from '~/store';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  http = inject(HttpClient);
  store = inject(Store<LabState>);
  translateSvc = inject(TranslateService);

  cacheData: Entities<Observable<ModData>> = {};
  cacheHash: Entities<Observable<ModHash>> = {};
  cacheI18n: Entities<Observable<ModI18n | null>> = {};

  initialize(): void {
    combineLatest([
      this.store.select(Settings.getModId),
      this.translateSvc.onLangChange.pipe(startWith('en')),
    ]).subscribe(([id]) => {
      this.requestData(id).subscribe();
    });
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
        shareReplay(),
      );
    }

    const data$ = this.cacheData[id];

    /** Setup observable for hash */
    if (!this.cacheHash[id]) {
      this.cacheHash[id] = this.http.get<ModHash>(`data/${id}/hash.json`).pipe(
        tap((value) => {
          payload.hash = { id, value };
        }),
        shareReplay(),
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
            shareReplay(),
          );
      }
      i18n$ = this.cacheI18n[i18nKey];
    }

    return combineLatest([data$, hash$, i18n$]).pipe(
      tap(() => {
        if (payload.data || payload.hash || payload.i18n) {
          this.store.dispatch(new Datasets.LoadModAction(payload));
        }
      }),
    );
  }
}

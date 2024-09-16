import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  catchError,
  combineLatest,
  Observable,
  of,
  shareReplay,
  tap,
} from 'rxjs';

import { ModData } from '~/models/data/mod-data';
import { ModHash } from '~/models/data/mod-hash';
import { ModI18n } from '~/models/data/mod-i18n';
import { Entities } from '~/models/entities';
import { loadMod } from '~/store/datasets/datasets.actions';
import { selectModId } from '~/store/settings/settings.selectors';

import { TranslateService } from './translate.service';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  http = inject(HttpClient);
  store = inject(Store);
  translateSvc = inject(TranslateService);

  cacheData: Entities<Observable<ModData>> = {};
  cacheHash: Entities<Observable<ModHash>> = {};
  cacheI18n: Entities<Observable<ModI18n | null>> = {};

  initialize(): void {
    combineLatest([
      this.store.select(selectModId),
      this.translateSvc.lang$,
    ]).subscribe(([id]) => {
      this.requestData(id).subscribe();
    });
  }

  requestData(id: string): Observable<[ModData, ModHash, ModI18n | null]> {
    let data: ModData | undefined;
    let hash: ModHash | undefined;
    let i18n: ModI18n | undefined;

    /** Setup observable for data */
    if (!this.cacheData[id]) {
      this.cacheData[id] = this.http.get<ModData>(`data/${id}/data.json`).pipe(
        tap((value) => (data = value)),
        shareReplay(),
      );
    }

    const data$ = this.cacheData[id];

    /** Setup observable for hash */
    if (!this.cacheHash[id]) {
      this.cacheHash[id] = this.http.get<ModHash>(`data/${id}/hash.json`).pipe(
        tap((value) => (hash = value)),
        shareReplay(),
      );
    }

    const hash$ = this.cacheHash[id];

    /** Setup observable for i18n */
    const i18nLang = this.translateSvc.currentLang;
    const i18nId = `${id}-${i18nLang}`;
    const skipI18n = i18nLang === 'en';
    let i18n$: Observable<ModI18n | null>;
    if (skipI18n) {
      i18n$ = of(null);
    } else {
      if (!this.cacheI18n[i18nId]) {
        this.cacheI18n[i18nId] = this.http
          .get<ModI18n>(`data/${id}/i18n/${i18nLang}.json`)
          .pipe(
            catchError(() => {
              console.warn(`No localization file found for ${i18nId}`);
              return of(null);
            }),
            tap((value) => (i18n = value ?? undefined)),
            shareReplay(),
          );
      }
      i18n$ = this.cacheI18n[i18nId];
    }

    return combineLatest([data$, hash$, i18n$]).pipe(
      tap(() => {
        if (data || hash || i18n) {
          this.store.dispatch(loadMod({ id, i18nId, data, hash, i18n }));
        }
      }),
    );
  }
}

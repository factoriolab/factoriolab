import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { effect, inject, Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  EMPTY,
  Observable,
  shareReplay,
  tap,
} from 'rxjs';

import { data } from '~/models/app-data';
import { ModData } from '~/models/data/mod-data';
import { ModHash } from '~/models/data/mod-hash';
import { ModI18n } from '~/models/data/mod-i18n';
import { Language } from '~/models/enum/language';
import { Entities, Optional } from '~/models/utils';
import { DatasetsService } from '~/store/datasets.service';
import { PreferencesService } from '~/store/preferences.service';
import { SettingsService } from '~/store/settings.service';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  http = inject(HttpClient);
  datasetsSvc = inject(DatasetsService);
  preferencesSvc = inject(PreferencesService);
  settingsSvc = inject(SettingsService);

  cacheData: Entities<Observable<[ModData, ModHash]>> = {};
  cacheI18n: Entities<Entities<Observable<ModI18n>>> = {};

  error$ = new BehaviorSubject<Optional<string>>(undefined);
  private hashSet = new Set(data.modHash);

  config$ = this.http
    .get<{
      version: string;
      branch: string;
      date: string;
    }>('assets/release.json')
    .pipe(shareReplay(1));

  constructor() {
    effect(() => {
      const modId = this.settingsSvc.modId();
      if (modId == null) return;
      this.requestData(modId).subscribe();
    });

    effect(() => {
      const modId = this.settingsSvc.modId();
      const lang = this.preferencesSvc.language();
      if (modId == null || lang === Language.English) return;
      this.requestI18n(modId, lang).subscribe();
    });
  }

  requestData(id: string): Observable<[ModData, ModHash]> {
    /** Setup observable for data */
    if (!this.cacheData[id])
      this.cacheData[id] = combineLatest([
        this.http.get<ModData>(`data/${id}/data.json`),
        this.http.get<ModHash>(`data/${id}/hash.json`),
      ]).pipe(
        tap(([data, hash]) => {
          this.datasetsSvc.loadData(id, data, hash);
        }),
        catchError((e: HttpErrorResponse) => {
          this.error$.next(e.message);
          return EMPTY;
        }),
        shareReplay(),
      );

    return this.cacheData[id];
  }

  requestI18n(id: string, lang: Language): Observable<ModI18n> {
    if (!this.cacheI18n[id]) this.cacheI18n[id] = {};
    if (!this.cacheI18n[id][lang])
      this.cacheI18n[id][lang] = this.http
        .get<ModI18n>(`data/${id}/i18n/${lang}.json`)
        .pipe(
          catchError(() => EMPTY),
          tap((i18n) => {
            this.datasetsSvc.loadI18n(id, lang, i18n);
          }),
          shareReplay(),
        );

    return this.cacheI18n[id][lang];
  }
}

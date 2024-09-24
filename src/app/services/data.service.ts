import { HttpClient } from '@angular/common/http';
import { computed, effect, inject, Injectable } from '@angular/core';
import {
  catchError,
  combineLatest,
  EMPTY,
  Observable,
  shareReplay,
  tap,
} from 'rxjs';

import { ModData } from '~/models/data/mod-data';
import { ModHash } from '~/models/data/mod-hash';
import { ModI18n } from '~/models/data/mod-i18n';
import { Language } from '~/models/enum/language';
import { Entities } from '~/models/utils';

import { DatasetsService } from './datasets.service';
import { PreferencesService } from './preferences.service';
import { SettingsService } from './settings.service';

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

  modData = computed(() => {
    const modId = this.settingsSvc.modId();
    if (modId == null) return undefined;
    this.requestData(modId).subscribe();
  });

  constructor() {
    effect(() => {
      const modId = this.settingsSvc.modId();
      if (modId == null) return undefined;
      this.requestData(modId).subscribe();
    });

    effect(() => {
      const modId = this.settingsSvc.modId();
      const lang = this.preferencesSvc.language();
      if (modId == null || lang === Language.English) return undefined;
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
        shareReplay(),
      );

    return this.cacheData[id];
  }

  requestI18n(id: string, lang: Language): Observable<ModI18n> {
    if (lang === Language.English) return EMPTY;

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

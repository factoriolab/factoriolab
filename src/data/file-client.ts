import { HttpClient } from '@angular/common/http';
import { effect, inject, Injectable } from '@angular/core';
import {
  catchError,
  combineLatest,
  EMPTY,
  map,
  Observable,
  shareReplay,
  tap,
} from 'rxjs';

import { Release } from '~/data/release';
import { ModData } from '~/data/schema/mod-data';
import { ModHash } from '~/data/schema/mod-hash';
import { ModI18n } from '~/data/schema/mod-i18n';
import { DatasetsStore } from '~/state/datasets/datasets-store';
import { PreferencesStore } from '~/state/preferences/preferences-store';
import { SettingsStore } from '~/state/settings/settings-store';
import { Language } from '~/translate/language';

@Injectable({ providedIn: 'root' })
export class FileClient {
  private readonly http = inject(HttpClient);
  private readonly datasetsStore = inject(DatasetsStore);
  private readonly preferencesStore = inject(PreferencesStore);
  private readonly settingsStore = inject(SettingsStore);

  private cacheData: Record<string, Observable<[ModData, ModHash]>> = {};
  private cacheI18n: Record<string, Record<string, Observable<ModI18n>>> = {};

  config$ = this.http.get<Release>('release.json').pipe(shareReplay(1));
  version$ = this.config$.pipe(
    map((c) => `FactorioLab ${c.version || '(dev)'}`),
  );

  constructor() {
    effect(() => {
      const modId = this.settingsStore.modId();
      if (modId == null) return;
      this.requestData(modId).subscribe();
    });

    effect(() => {
      const modId = this.settingsStore.modId();
      const lang = this.preferencesStore.language();
      if (modId == null || lang === 'en') return;
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
          this.datasetsStore.loadData(id, data, hash);
        }),
        catchError(() => EMPTY),
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
            this.datasetsStore.loadI18n(id, lang, i18n);
          }),
          shareReplay(),
        );

    return this.cacheI18n[id][lang];
  }
}

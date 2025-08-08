import { HttpClient } from '@angular/common/http';
import { effect, inject, Injectable } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  first,
  map,
  Observable,
  of,
  shareReplay,
  switchMap,
} from 'rxjs';

import { PreferencesStore } from '../state/preferences/preferences-store';
import { log } from '../utils/log';
import { coalesce } from '../utils/nullish';
import { Language } from './language';

export interface LangData {
  [key: string]: LangData | string;
}
export type InterpolateVal = string | number | null | undefined;

@Injectable({ providedIn: 'root' })
export class Translate {
  private readonly http = inject(HttpClient);
  private readonly preferences = inject(PreferencesStore);

  private templateMatcher = /{{\s?([^{}\s]*)\s?}}/g;
  private langDataCache: Record<string, Observable<LangData>> = {};
  private defaultLang$ = new BehaviorSubject<Language>('en');
  private currentLang$ = new BehaviorSubject<Language>(
    this.preferences.language(),
  );
  private defaultLangData$ = this.defaultLang$.pipe(
    distinctUntilChanged(),
    switchMap((lang) => this.getLangData(lang)),
  );
  private currentLangData$ = this.currentLang$.pipe(
    distinctUntilChanged(),
    switchMap((lang) => this.getLangData(lang)),
  );

  protected getLangData(lang: string): Observable<LangData> {
    this.langDataCache[lang] ??= this.http
      .get<LangData>(`i18n/${lang}.json`)
      .pipe(shareReplay(1));

    return this.langDataCache[lang];
  }

  lang$ = this.currentLang$.asObservable();

  get currentLang(): string {
    return this.currentLang$.value;
  }

  constructor() {
    effect(() => {
      const lang = this.preferences.language();
      if (this.currentLang$.value === lang) return;
      this.currentLang$.next(lang);
      log('set_lang', lang);
    });
  }

  /** Subscribe to language data to ensure it is ready to use */
  load(): void {
    combineLatest([this.defaultLangData$, this.currentLangData$])
      .pipe(first())
      .subscribe();
  }

  getValue(langData: LangData, key: string): LangData | string | undefined {
    let target: LangData | string | undefined = langData;
    const keys = key.split('.');
    key = '';
    do {
      key += coalesce(keys.shift(), '');
      if (
        typeof target === 'object' &&
        target[key] != null &&
        (typeof target[key] === 'object' || !keys.length)
      ) {
        target = target[key];
        key = '';
      } else if (!keys.length) {
        target = undefined;
      } else {
        key += '.';
      }
    } while (keys.length);

    return target;
  }

  interpolate(value: string, params?: Record<string, InterpolateVal>): string {
    if (params == null) return value;

    return value.replace(
      this.templateMatcher,
      (substring: string, b: string) => params[b]?.toString() ?? substring,
    );
  }

  get(
    key: string,
    params?: Record<string, InterpolateVal>,
  ): Observable<string> {
    return this.currentLangData$.pipe(
      switchMap((langData) => {
        const result = this.getValue(langData, key);
        if (typeof result === 'string') return of(result);
        return this.defaultLangData$.pipe(
          map((langData) => {
            const result = this.getValue(langData, key);
            return typeof result === 'string' ? result : key;
          }),
        );
      }),
      map((value) => this.interpolate(value, params)),
    );
  }

  multi<T extends string[]>(
    keys: [...T],
  ): Observable<{ [Index in keyof T]: string }>;
  multi(keys: string[]): Observable<string[]> {
    return combineLatest([...keys].map((k) => this.get(k)));
  }
}

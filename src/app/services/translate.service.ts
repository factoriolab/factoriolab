import { HttpClient } from '@angular/common/http';
import { inject, Injectable, InjectionToken } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
  Observable,
  of,
  shareReplay,
  switchMap,
} from 'rxjs';

import { coalesce } from '~/helpers';
import { Entities } from '~/models/utils';

export const DEFAULT_LANGUAGE = new InjectionToken<string>('DEFAULT_LANGUAGE');

export interface LangData {
  [key: string]: LangData | string;
}
export type InterpolateVal = string | number | null | undefined;

@Injectable({
  providedIn: 'root',
})
export class TranslateService {
  http = inject(HttpClient);

  private _templateMatcher = /{{\s?([^{}\s]*)\s?}}/g;
  private _langDataCache: Entities<Observable<LangData>> = {};
  private _defaultLang$ = new BehaviorSubject(inject(DEFAULT_LANGUAGE));
  private _currentLang$ = new BehaviorSubject(inject(DEFAULT_LANGUAGE));
  private _defaultLangData$ = this._defaultLang$.pipe(
    distinctUntilChanged(),
    switchMap((lang) => this._getLangData(lang)),
  );
  private _currentLangData$ = this._currentLang$.pipe(
    distinctUntilChanged(),
    switchMap((lang) => this._getLangData(lang)),
  );

  protected _getLangData(lang: string): Observable<LangData> {
    if (this._langDataCache[lang] == null) {
      this._langDataCache[lang] = this.http
        .get<LangData>(`assets/i18n/${lang}.json`)
        .pipe(shareReplay(1));
    }

    return this._langDataCache[lang];
  }

  lang$ = this._currentLang$.asObservable();

  get currentLang(): string {
    return this._currentLang$.value;
  }

  constructor() {
    // Immediately subscribe to language data to ensure it is ready to use
    this._defaultLangData$.subscribe();
    this._currentLangData$.subscribe();
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

  interpolate(value: string, params?: Entities<InterpolateVal>): string {
    if (params == null) return value;

    return value.replace(
      this._templateMatcher,
      (substring: string, b: string) => params[b]?.toString() ?? substring,
    );
  }

  use(lang: string): void {
    this._currentLang$.next(lang);
  }

  get(key: string, params?: Entities<InterpolateVal>): Observable<string> {
    return this._currentLangData$.pipe(
      switchMap((langData) => {
        const result = this.getValue(langData, key);
        if (typeof result === 'string') return of(result);
        return this._defaultLangData$.pipe(
          map((langData) => {
            const result = this.getValue(langData, key);
            return typeof result === 'string' ? result : key;
          }),
        );
      }),
      map((value) => this.interpolate(value, params)),
    );
  }

  multi<T extends string, Tuple extends T[]>(
    keys: [...Tuple],
  ): Observable<{ [Index in keyof Tuple]: string }>;
  multi(keys: string[]): Observable<string[]> {
    return combineLatest([...keys].map((k) => this.get(k)));
  }
}

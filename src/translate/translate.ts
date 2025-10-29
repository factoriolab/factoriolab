import { httpResource } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, firstValueFrom } from 'rxjs';

import { PreferencesStore } from '~/state/preferences/preferences-store';

export interface LangData {
  [key: string]: LangData | string;
}
export type TranslateData = Record<string, string | undefined>;
export type TranslateVal = string | number | null | undefined;
export type TranslateParams = Record<string, TranslateVal>;

interface ParseEntry {
  data: LangData;
  key: string;
  path: string;
}

@Injectable({ providedIn: 'root' })
export class Translate {
  private readonly preferences = inject(PreferencesStore);

  private readonly templateMatcher = /{{\s?([^{}\s]*)\s?}}/g;

  private readonly defaultData = httpResource<LangData>(() => `i18n/en.json`);
  private readonly currentData = httpResource<LangData>(
    () => `i18n/${this.preferences.language()}.json`,
  );

  data = computed(() => {
    const curData = this.currentData.value();
    const defData = this.defaultData.value();
    const result: TranslateData = {};
    if (defData != null) this.parseLangData(result, defData);
    if (curData != null) this.parseLangData(result, curData);
    return result;
  });

  load(): Promise<boolean> {
    return firstValueFrom(
      toObservable(this.currentData.isLoading).pipe(filter((v) => v)),
    );
  }

  get(key: string, params?: TranslateParams): string {
    const result = this.data()[key];
    if (result == null) return key;
    return this.interpolate(result, params);
  }

  private interpolate(value: string, params?: TranslateParams): string {
    if (params == null) return value;

    return value.replace(
      this.templateMatcher,
      (substring: string, b: string) => params[b]?.toString() ?? substring,
    );
  }

  private parseLangData(result: TranslateData, data: LangData): void {
    const entries = Object.keys(data).map(
      (key): ParseEntry => ({ data, key, path: key }),
    );
    while (entries.length) {
      const entry = entries.pop();
      if (entry == null) break;
      const data = entry.data[entry.key];
      if (typeof data === 'string') result[entry.path] = data;
      else {
        entries.push(
          ...Object.keys(data).map(
            (key): ParseEntry => ({
              data,
              key,
              path: `${entry.path}.${key}`,
            }),
          ),
        );
      }
    }
  }
}

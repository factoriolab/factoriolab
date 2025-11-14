import { httpResource } from '@angular/common/http';
import { computed, inject, Injectable, linkedSignal } from '@angular/core';
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

  private readonly httpData = httpResource<LangData>(
    () => `i18n/${this.preferences.language()}.json`,
  );

  private readonly safeHttpData = computed(() => {
    if (this.httpData.error()) return undefined;
    return this.httpData.value();
  });

  readonly data = linkedSignal<LangData | undefined, TranslateData>({
    source: this.safeHttpData,
    computation: (data, previous) => {
      if (data == null && previous) return previous.value;
      return this.parseLangData(data);
    },
  });

  load(): Promise<boolean> {
    return firstValueFrom(
      toObservable(this.httpData.isLoading).pipe(filter((v) => v)),
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

  private parseLangData(data: LangData | undefined): TranslateData {
    const result: TranslateData = {};
    if (data == null) return result;

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

    return result;
  }
}

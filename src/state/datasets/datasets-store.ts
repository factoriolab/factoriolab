import { computed, Injectable } from '@angular/core';

import { datasets } from '~/data/datasets';
import { Mod } from '~/data/mod';
import { ModData } from '~/data/schema/mod-data';
import { ModHash } from '~/data/schema/mod-hash';
import { ModI18n } from '~/data/schema/mod-i18n';
import { Language } from '~/translate/language';
import { spread } from '~/utils/object';

import { RecordStore } from '../store';
import { JsonData } from './json-data';

@Injectable({ providedIn: 'root' })
export class DatasetsStore extends RecordStore<JsonData> {
  modRecord = computed(() => {
    const state = this._state();
    return datasets.mods.reduce((e: Record<string, Mod | undefined>, m) => {
      const d = state[m.id]?.data;
      if (d != null) e[m.id] = spread(m as Mod, d);
      return e;
    }, {});
  });

  loadData(id: string, data: ModData, hash: ModHash): void {
    this.update((state) => ({ [id]: spread(state[id], { data, hash }) }));
  }

  loadI18n(id: string, lang: Language, i18n: ModI18n): void {
    this.update((state) => ({
      [id]: spread(state[id], {
        i18n: spread(state[id]?.i18n, { [lang]: i18n }),
      }),
    }));
  }
}

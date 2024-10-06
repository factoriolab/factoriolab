import { computed, Injectable } from '@angular/core';
import { data } from 'src/data';

import { spread } from '~/helpers';
import { ModData } from '~/models/data/mod-data';
import { ModHash } from '~/models/data/mod-hash';
import { ModI18n } from '~/models/data/mod-i18n';
import { Language } from '~/models/enum/language';
import { Mod } from '~/models/mod';
import { Entities } from '~/models/utils';

import { EntityStore } from './store';

export interface JsonData {
  data?: ModData;
  hash?: ModHash;
  i18n?: Entities<ModI18n>;
}

export type DatasetsState = Entities<JsonData>;

@Injectable({
  providedIn: 'root',
})
export class DatasetsService extends EntityStore<JsonData> {
  modEntities = computed(() => {
    const state = this._state();
    return data.mods.reduce((e: Entities<Mod | undefined>, m) => {
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

import { createReducer, on } from '@ngrx/store';

import { spread } from '~/helpers';
import { ModData } from '~/models/data/mod-data';
import { ModHash } from '~/models/data/mod-hash';
import { ModI18n } from '~/models/data/mod-i18n';
import { Entities } from '~/models/entities';

import * as Actions from './datasets.actions';

export interface DatasetsState {
  data: Entities<ModData | undefined>;
  hash: Entities<ModHash | undefined>;
  i18n: Entities<ModI18n | undefined>;
}

export const initialDatasetsState: DatasetsState = {
  data: {},
  hash: {},
  i18n: {},
};

export const datasetsReducer = createReducer(
  initialDatasetsState,
  on(Actions.loadMod, (state, { id, i18nId, data, hash, i18n }) =>
    spread(state, {
      data: spread(state.data, { [id]: data }),
      hash: spread(state.hash, { [id]: hash }),
      i18n: spread(state.i18n, { [i18nId]: i18n }),
    }),
  ),
);

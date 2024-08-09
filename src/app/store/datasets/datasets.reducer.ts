import { createReducer, on } from '@ngrx/store';

import { spread } from '~/helpers';
import { Entities, ModData, ModHash, ModI18n } from '~/models';
import * as Actions from './datasets.actions';

export interface DatasetsState {
  data: Entities<ModData | undefined>;
  hash: Entities<ModHash | undefined>;
  i18n: Entities<ModI18n | undefined>;
}

export const initialState: DatasetsState = {
  data: {},
  hash: {},
  i18n: {},
};

export const datasetsReducer = createReducer(
  initialState,
  on(Actions.loadMod, (state, { id, i18nId, data, hash, i18n }) =>
    spread(state, {
      data: spread(state.data, { [id]: data }),
      hash: spread(state.hash, { [id]: hash }),
      i18n: spread(state.i18n, { [i18nId]: i18n }),
    }),
  ),
);

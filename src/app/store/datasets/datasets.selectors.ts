import { createSelector } from '@ngrx/store';
import { data } from 'src/data';

import { Entities } from '~/models/entities';
import { Mod } from '~/models/mod';

import { LabState } from '../';
import { DatasetsState } from './datasets.reducer';

export const datasetsState = (state: LabState): DatasetsState =>
  state.datasetsState;
export const selectDataEntities = createSelector(
  datasetsState,
  (state) => state.data,
);
export const selectI18nEntities = createSelector(
  datasetsState,
  (state) => state.i18n,
);
export const selectHashEntities = createSelector(
  datasetsState,
  (state) => state.hash,
);

export const selectModEntities = createSelector(
  selectDataEntities,
  (entities) =>
    data.mods.reduce((e: Entities<Mod | undefined>, m) => {
      const data = entities[m.id];
      if (data != null) e[m.id] = { ...m, ...data };
      return e;
    }, {}),
);

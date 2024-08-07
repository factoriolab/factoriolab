import { createSelector } from '@ngrx/store';

import { data } from 'src/data';
import { Entities, Mod } from '~/models';
import { LabState } from '../';
import { DatasetsState } from './datasets.reducer';

export const datasetsState = (state: LabState): DatasetsState =>
  state.datasetsState;
export const selectData = createSelector(datasetsState, (state) => state.data);
export const selectI18n = createSelector(datasetsState, (state) => state.i18n);
export const selectHash = createSelector(datasetsState, (state) => state.hash);

export const selectModEntities = createSelector(selectData, (entities) =>
  data.mods.reduce((e: Entities<Mod | undefined>, m) => {
    const data = entities[m.id];
    if (data != null) e[m.id] = { ...m, ...data };
    return e;
  }, {}),
);

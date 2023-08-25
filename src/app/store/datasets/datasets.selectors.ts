import { createSelector } from '@ngrx/store';

import { Entities, Mod, ModInfo } from '~/models';
import { LabState } from '../';
import { DatasetsState } from './datasets.reducer';

/* Base selector functions */
export const datasetsState = (state: LabState): DatasetsState =>
  state.datasetsState;

export const getModSets = createSelector(datasetsState, (state) => state.mods);
export const getDataRecord = createSelector(
  datasetsState,
  (state) => state.dataRecord,
);
export const getI18nRecord = createSelector(
  datasetsState,
  (state) => state.i18nRecord,
);
export const getHashRecord = createSelector(
  datasetsState,
  (state) => state.hashRecord,
);

/* Complex selectors */
export const getModInfoRecord = createSelector(getModSets, (mods) =>
  mods.reduce((e: Entities<ModInfo | undefined>, m) => {
    e[m.id] = m;
    return e;
  }, {}),
);

export const getModRecord = createSelector(
  getModSets,
  getDataRecord,
  (mods, entities) =>
    mods.reduce((e: Entities<Mod | undefined>, m) => {
      const data = entities[m.id];
      if (data != null) {
        e[m.id] = { ...m, ...data };
      }
      return e;
    }, {}),
);

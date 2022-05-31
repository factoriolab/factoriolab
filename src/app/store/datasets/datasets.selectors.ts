import { createSelector } from '@ngrx/store';

import { Entities, Mod, ModInfo } from '~/models';
import { LabState } from '../';
import { DatasetsState } from './datasets.reducer';

/* Base selector functions */
export const datasetsState = (state: LabState): DatasetsState =>
  state.datasetsState;

export const getAppData = createSelector(datasetsState, (state) => state.app);
export const getModSets = createSelector(datasetsState, (state) => state.mods);
export const getDataEntities = createSelector(
  datasetsState,
  (state) => state.dataEntities
);
export const getI18nEntities = createSelector(
  datasetsState,
  (state) => state.i18nEntities
);
export const getHashEntities = createSelector(
  datasetsState,
  (state) => state.hashEntities
);

/* Complex selectors */
export const getModInfoEntities = createSelector(getModSets, (mods) =>
  mods.reduce((e: Entities<ModInfo>, m) => {
    e[m.id] = m;
    return e;
  }, {})
);

export const getModEntities = createSelector(
  getModSets,
  getDataEntities,
  (mods, entities) =>
    mods.reduce((e: Entities<Mod>, m) => {
      if (entities[m.id]) {
        e[m.id] = { ...m, ...entities[m.id] };
      }
      return e;
    }, {})
);

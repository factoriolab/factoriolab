import { createSelector } from '@ngrx/store';

import { Entities, Mod, ModInfo } from '~/models';
import { LabState } from '../';
import { DatasetsState } from './datasets.reducer';

/* Base selector functions */
export const datasetsState = (state: LabState): DatasetsState =>
  state.datasetsState;

export const getAppData = createSelector(datasetsState, (state) => state.app);
export const getBaseSets = createSelector(datasetsState, (state) => state.base);
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
export const getBaseInfoEntities = createSelector(getBaseSets, (base) =>
  base.reduce((e: Entities<ModInfo>, b) => {
    e[b.id] = b;
    return e;
  }, {})
);

export const getBaseEntities = createSelector(
  getBaseSets,
  getDataEntities,
  (base, entities) =>
    base.reduce((e: Entities<Mod>, b) => {
      if (entities[b.id]) {
        e[b.id] = { ...b, ...entities[b.id] };
      }
      return e;
    }, {})
);

export const getModEntities = createSelector(
  getModSets,
  getDataEntities,
  (mod, entities) =>
    mod.reduce((e: Entities<Mod>, m) => {
      if (entities[m.id]) {
        e[m.id] = { ...m, ...entities[m.id] };
      }
      return e;
    }, {})
);

import { createSelector } from '@ngrx/store';

import { Entities, Mod, ModInfo } from '~/models';
import { LabState } from '..';
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
      e[b.id] = entities[b.id] ? { ...b, ...entities[b.id] } : null;
      return e;
    }, {})
);

export const getModEntities = createSelector(
  getModSets,
  getDataEntities,
  (mod, entities) =>
    mod.reduce((e: Entities<Mod>, m) => {
      e[m.id] = entities[m.id] ? { ...m, ...entities[m.id] } : null;
      return e;
    }, {})
);

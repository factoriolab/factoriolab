import { compose, createSelector } from '@ngrx/store';

import { Entities, Mod } from '~/models';
import { State } from '..';
import { DatasetsState } from './datasets.reducer';

/* Base selector functions */
export const datasetsState = (state: State) => state.datasetsState;
const sAppData = (state: DatasetsState) => state.app;
const sBaseSets = (state: DatasetsState) => state.base;
const sModSets = (state: DatasetsState) => state.mods;
const sDataEntities = (state: DatasetsState) => state.dataEntities;

/* Simple selectors */
export const getAppData = compose(sAppData, datasetsState);
export const getBaseSets = compose(sBaseSets, datasetsState);
export const getModSets = compose(sModSets, datasetsState);
export const getDataEntities = compose(sDataEntities, datasetsState);

/* Complex selectors */
export const getBaseEntities = createSelector(
  getBaseSets,
  getDataEntities,
  (base, entities): Entities<Mod> =>
    base.reduce(
      (e: Entities<Mod>, b) => ({
        ...e,
        ...{ [b.id]: entities[b.id] ? { ...b, ...entities[b.id] } : null },
      }),
      {}
    )
);

export const getModEntities = createSelector(
  getModSets,
  getDataEntities,
  (mod, entities): Entities<Mod> =>
    mod.reduce(
      (e: Entities<Mod>, m) => ({
        ...e,
        ...{ [m.id]: entities[m.id] ? { ...m, ...entities[m.id] } : null },
      }),
      {}
    )
);

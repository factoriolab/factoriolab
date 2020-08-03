import { compose, createSelector } from '@ngrx/store';

import { Entities, ModInfo } from '~/models';
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
export const getBaseEntities = createSelector(getBaseSets, (base) =>
  base.reduce((e: Entities<ModInfo>, b) => ({ ...e, ...{ [b.id]: b } }), {})
);

export const getModEntities = createSelector(getModSets, (mod) =>
  mod.reduce((e: Entities<ModInfo>, m) => ({ ...e, ...{ [m.id]: m } }), {})
);

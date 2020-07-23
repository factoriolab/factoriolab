import { compose, createSelector } from '@ngrx/store';

import { State } from '..';
import { DatasetsState } from './datasets.reducer';

/* Base selector functions */
export const datasetsState = (state: State) => state.datasetsState;
const sAppData = (state: DatasetsState) => state.app;
const sBaseEntities = (state: DatasetsState) => state.baseEntities;
const sModIds = (state: DatasetsState) => state.modIds;
const sModEntities = (state: DatasetsState) => state.modEntities;

/* Simple selectors */
export const getAppData = compose(sAppData, datasetsState);
export const getBaseEntities = compose(sBaseEntities, datasetsState);
export const getModIds = compose(sModIds, datasetsState);
export const getModEntities = compose(sModEntities, datasetsState);

/* Complex selectors */
export const getMods = createSelector(
  getModIds,
  getModEntities,
  (ids, entities) => ids.map((i) => entities[i])
);

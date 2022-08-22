import { createSelector } from '@ngrx/store';
import { SelectItem } from 'primeng/api';

import { LabState } from '../';
import { PreferencesState } from './preferences.reducer';

/* Base selector functions */
export const preferencesState = (state: LabState): PreferencesState =>
  state.preferencesState;

export const getStates = createSelector(
  preferencesState,
  (state) => state.states
);
export const getColumns = createSelector(
  preferencesState,
  (state) => state.columns
);
export const getSimplexType = createSelector(
  preferencesState,
  (state) => state.simplexType
);
export const getPowerUnit = createSelector(
  preferencesState,
  (state) => state.powerUnit
);
export const getLanguage = createSelector(
  preferencesState,
  (state) => state.language
);

/** Complex selectors */
export const getSavedStates = createSelector(getStates, (states) =>
  Object.keys(states).map(
    (i): SelectItem => ({
      label: i,
      value: i,
    })
  )
);

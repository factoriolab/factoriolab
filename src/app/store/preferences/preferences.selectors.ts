import { createSelector } from '@ngrx/store';

import { LabState } from '../';
import { PreferencesState } from './preferences.reducer';

/* Base selector functions */
export const preferencesState = (state: LabState): PreferencesState =>
  state.preferencesState;

export const getStates = createSelector(
  preferencesState,
  (state) => state.states,
);
export const getColumns = createSelector(
  preferencesState,
  (state) => state.columns,
);
export const getPowerUnit = createSelector(
  preferencesState,
  (state) => state.powerUnit,
);
export const getLanguage = createSelector(
  preferencesState,
  (state) => state.language,
);
export const getTheme = createSelector(
  preferencesState,
  (state) => state.theme,
);
export const getBypassLanding = createSelector(
  preferencesState,
  (state) => state.bypassLanding,
);
export const getShowTechLabels = createSelector(
  preferencesState,
  (state) => state.showTechLabels,
);
export const getPaused = createSelector(
  preferencesState,
  (state) => state.paused,
);

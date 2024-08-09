import { createSelector } from '@ngrx/store';

import { LabState } from '../';
import { PreferencesState } from './preferences.reducer';

/* Base selector functions */
export const preferencesState = (state: LabState): PreferencesState =>
  state.preferencesState;

export const selectStates = createSelector(
  preferencesState,
  (state) => state.states,
);
export const selectColumns = createSelector(
  preferencesState,
  (state) => state.columns,
);
export const selectPowerUnit = createSelector(
  preferencesState,
  (state) => state.powerUnit,
);
export const selectLanguage = createSelector(
  preferencesState,
  (state) => state.language,
);
export const selectTheme = createSelector(
  preferencesState,
  (state) => state.theme,
);
export const selectBypassLanding = createSelector(
  preferencesState,
  (state) => state.bypassLanding,
);
export const selectShowTechLabels = createSelector(
  preferencesState,
  (state) => state.showTechLabels,
);
export const selectPaused = createSelector(
  preferencesState,
  (state) => state.paused,
);
export const selectFlowSettings = createSelector(
  preferencesState,
  (state) => state.flowSettings,
);
export const selectConvertObjectiveValues = createSelector(
  preferencesState,
  (state) => state.convertObjectiveValues,
);

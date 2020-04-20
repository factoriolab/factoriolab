import { compose } from '@ngrx/store';

import { State } from '../';
import { SettingsState } from './settings.reducer';

/* Base selector functions */
export const settingsState = (state: State) => state.settingsState;
const sDisplayRate = (state: SettingsState) => state.displayRate;
const sBelt = (state: SettingsState) => state.belt;
const sOilRecipe = (state: SettingsState) => state.oilRecipe;
const sFlowRate = (state: SettingsState) => state.flowRate;

/* Simple selectors */
export const getDisplayRate = compose(sDisplayRate, settingsState);
export const getBelt = compose(sBelt, settingsState);
export const getOilRecipe = compose(sOilRecipe, settingsState);
export const getFlowRate = compose(sFlowRate, settingsState);

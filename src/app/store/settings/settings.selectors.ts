import { compose, createSelector } from '@ngrx/store';

import { State } from '../';
import { SettingsState } from './settings.reducer';
import Fraction from 'fraction.js';

/* Base selector functions */
export const settingsState = (state: State) => state.settingsState;
const sDisplayRate = (state: SettingsState) => state.displayRate;
const sBelt = (state: SettingsState) => state.belt;
const sOilRecipe = (state: SettingsState) => state.oilRecipe;
const sFuel = (state: SettingsState) => state.fuel;
const sResearchSpeed = (state: SettingsState) => state.researchSpeed;
const sFlowRate = (state: SettingsState) => state.flowRate;

/* Simple selectors */
export const getDisplayRate = compose(sDisplayRate, settingsState);
export const getBelt = compose(sBelt, settingsState);
export const getOilRecipe = compose(sOilRecipe, settingsState);
export const getFuel = compose(sFuel, settingsState);
export const getResearchSpeed = compose(sResearchSpeed, settingsState);
export const getFlowRate = compose(sFlowRate, settingsState);

/* Complex selectors */
export const getResearchFactor = createSelector(getResearchSpeed, (speed) =>
  new Fraction(100 + speed).div(100)
);

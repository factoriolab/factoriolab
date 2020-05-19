import { compose, createSelector } from '@ngrx/store';
import Fraction from 'fraction.js';

import { State } from '../';
import { SettingsState } from './settings.reducer';

/* Base selector functions */
export const settingsState = (state: State) => state.settingsState;
const sDisplayRate = (state: SettingsState) => state.displayRate;
const sItemPrecision = (state: SettingsState) => state.itemPrecision;
const sBeltPrecision = (state: SettingsState) => state.beltPrecision;
const sFactoryPrecision = (state: SettingsState) => state.factoryPrecision;
const sOilRecipe = (state: SettingsState) => state.oilRecipe;
const sFuel = (state: SettingsState) => state.fuel;
const sMiningBonus = (state: SettingsState) => state.miningBonus;
const sResearchSpeed = (state: SettingsState) => state.researchSpeed;
const sFlowRate = (state: SettingsState) => state.flowRate;
const sExpensive = (state: SettingsState) => state.expensive;

/* Simple selectors */
export const getDisplayRate = compose(sDisplayRate, settingsState);
export const getItemPrecision = compose(sItemPrecision, settingsState);
export const getBeltPrecision = compose(sBeltPrecision, settingsState);
export const getFactoryPrecision = compose(sFactoryPrecision, settingsState);
export const getOilRecipe = compose(sOilRecipe, settingsState);
export const getFuel = compose(sFuel, settingsState);
export const getMiningBonus = compose(sMiningBonus, settingsState);
export const getResearchSpeed = compose(sResearchSpeed, settingsState);
export const getFlowRate = compose(sFlowRate, settingsState);
export const getExpensive = compose(sExpensive, settingsState);

/* Complex selectors */
export const getResearchFactor = createSelector(getResearchSpeed, (speed) =>
  new Fraction(100 + speed).div(100)
);

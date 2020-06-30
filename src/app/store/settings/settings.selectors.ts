import { compose, createSelector } from '@ngrx/store';

import { State } from '../';
import { SettingsState } from './settings.reducer';
import { ResearchSpeedFactor, Rational } from '~/models';

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
const sTheme = (state: SettingsState) => state.theme;

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
export const getTheme = compose(sTheme, settingsState);

/* Complex selectors */
export const getRationalMiningBonus = createSelector(getMiningBonus, (bonus) =>
  Rational.fromNumber(bonus).div(Rational.hundred)
);
export const getRationalFlowRate = createSelector(getFlowRate, (rate) =>
  Rational.fromNumber(rate)
);
export const getResearchFactor = createSelector(
  getResearchSpeed,
  (speed) => ResearchSpeedFactor[speed]
);

import { compose } from '@ngrx/store';

import { State } from '../';
import { SettingsState } from './settings.reducer';

/* Base selector functions */
export const settingsState = (state: State) => state.settingsState;
const sDisplayRate = (state: SettingsState) => state.displayRate;
const sBelt = (state: SettingsState) => state.belt;
const sAssembler = (state: SettingsState) => state.assembler;
const sFurnace = (state: SettingsState) => state.furnace;
const sDrill = (state: SettingsState) => state.drill;
const sProdModule = (state: SettingsState) => state.prodModule;
const sOtherModule = (state: SettingsState) => state.otherModule;
const sBeaconType = (state: SettingsState) => state.beaconType;
const sBeaconCount = (state: SettingsState) => state.beaconCount;
const sOilRecipe = (state: SettingsState) => state.oilRecipe;
const sFlowRate = (state: SettingsState) => state.flowRate;

/* Simple selectors */
export const getDisplayRate = compose(sDisplayRate, settingsState);
export const getBelt = compose(sBelt, settingsState);
export const getAssembler = compose(sAssembler, settingsState);
export const getFurnace = compose(sFurnace, settingsState);
export const getDrill = compose(sDrill, settingsState);
export const getProdModule = compose(sProdModule, settingsState);
export const getOtherModule = compose(sOtherModule, settingsState);
export const getBeaconType = compose(sBeaconType, settingsState);
export const getBeaconCount = compose(sBeaconCount, settingsState);
export const getOilRecipe = compose(sOilRecipe, settingsState);
export const getFlowRate = compose(sFlowRate, settingsState);

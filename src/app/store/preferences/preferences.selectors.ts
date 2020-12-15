import { compose } from '@ngrx/store';
import { State } from '../';
import { PreferencesState } from './preferences.reducer';

export const preferencesState = (state: State) => state.preferencesState;
const sSort = (state: PreferencesState) => state.sort;
const sLinkValue = (state: PreferencesState) => state.linkValue;
const sTheme = (state: PreferencesState) => state.theme;
const sShowHeader = (state: PreferencesState) => state.showHeader;

export const getSort = compose(sSort, preferencesState);
export const getLinkValue = compose(sLinkValue, preferencesState);
export const getTheme = compose(sTheme, preferencesState);
export const getShowHeader = compose(sShowHeader, preferencesState);

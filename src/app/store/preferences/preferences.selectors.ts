import { compose } from '@ngrx/store';

import { State } from '../';
import { PreferencesState } from './preferences.reducer';

export const preferencesState = (state: State) => state.preferencesState;
const sColumns = (state: PreferencesState) => state.columns;
const sLinkValue = (state: PreferencesState) => state.linkValue;

export const getColumns = compose(sColumns, preferencesState);
export const getLinkValue = compose(sLinkValue, preferencesState);

import { compose } from '@ngrx/store';

import { State } from '../';
import { PreferencesState } from './preferences.reducer';

export const preferencesState = (state: State) => state.preferencesState;
const sLinkValue = (state: PreferencesState) => state.linkValue;

export const getLinkValue = compose(sLinkValue, preferencesState);

import { compose } from '@ngrx/store';

import { LinkValue } from '~/models';
import { State } from '../';
import { ColumnsState, PreferencesState } from './preferences.reducer';

export const preferencesState = (state: State): PreferencesState =>
  state.preferencesState;
const sColumns = (state: PreferencesState): ColumnsState => state.columns;
const sLinkValue = (state: PreferencesState): LinkValue => state.linkValue;

export const getColumns = compose(sColumns, preferencesState);
export const getLinkValue = compose(sLinkValue, preferencesState);

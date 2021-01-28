import { compose, createSelector } from '@ngrx/store';

import { Column, LinkValue } from '~/models';
import { State } from '../';
import { ColumnsState, PreferencesState } from './preferences.reducer';

export const preferencesState = (state: State): PreferencesState =>
  state.preferencesState;
const sColumns = (state: PreferencesState): ColumnsState => state.columns;
const sLinkValue = (state: PreferencesState): LinkValue => state.linkValue;

export const getColumns = compose(sColumns, preferencesState);
export const getLinkValue = compose(sLinkValue, preferencesState);

export const getLinkPrecision = createSelector(
  getLinkValue,
  getColumns,
  (linkValue, columns) => {
    switch (linkValue) {
      case LinkValue.Items:
        return columns[Column.Items].precision;
      case LinkValue.Belts:
        return columns[Column.Belts].precision;
      case LinkValue.Wagons:
        return columns[Column.Wagons].precision;
      case LinkValue.Factories:
        return columns[Column.Factories].precision;
      default:
        return null;
    }
  }
);

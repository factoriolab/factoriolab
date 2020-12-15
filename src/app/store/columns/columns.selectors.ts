import { createSelector } from '@ngrx/store';
import {
  AllColumns,
  ColumnSettings,
  DefaultColumnSettings,
  Entities,
} from '~/models';
import { State } from '..';

export const columnsState = (state: State) => state.columnsState;

export const getColumns = createSelector(columnsState, (state) =>
  AllColumns.reduce((e: Entities<ColumnSettings>, c) => {
    e[c] = { ...DefaultColumnSettings, ...state[c] };
    return e;
  }, {})
);

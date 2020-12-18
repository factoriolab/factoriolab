import { createSelector } from '@ngrx/store';
import { AllColumns, DEFAULT_PRECISION, Entities } from '~/models';
import { State } from '..';
import { ColumnsState } from './columns.reducer';

export const columnsState = (state: State) => state.columnsState;

export const getColumns = createSelector(
  columnsState,
  (state): ColumnsState => {
    const ids = state.ids;
    const precision: Entities<number> = AllColumns.reduce(
      (e: Entities<number>, c) => {
        e[c] = state[c] != null ? state[c] : DEFAULT_PRECISION;
        return e;
      },
      {}
    );

    return { ids, precision };
  }
);

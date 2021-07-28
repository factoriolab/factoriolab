import { compose, createSelector } from '@ngrx/store';

import { Column, Game, LinkValue } from '~/models';
import { State } from '../';
import { getGame } from '../settings';
import {
  ColumnsState,
  initialColumnsState,
  PreferencesState,
} from './preferences.reducer';

export const preferencesState = (state: State): PreferencesState =>
  state.preferencesState;
const sColumns = (state: PreferencesState): ColumnsState => state.columns;
const sLinkSize = (state: PreferencesState): LinkValue => state.linkSize;
const sLinkText = (state: PreferencesState): LinkValue => state.linkText;
const sSimplex = (state: PreferencesState): boolean => state.simplex;

export const getColumns = compose(sColumns, preferencesState);
export const getLinkSize = compose(sLinkSize, preferencesState);
export const getLinkText = compose(sLinkText, preferencesState);
export const getSimplex = compose(sSimplex, preferencesState);

export const getColumnsState = createSelector(
  getColumns,
  getGame,
  (col, game): ColumnsState =>
    game === Game.DysonSphereProgram
      ? {
          ...initialColumnsState,
          ...col,
          ...{
            [Column.Wagons]: { ...col[Column.Wagons], ...{ show: false } },
            [Column.Overclock]: {
              ...col[Column.Overclock],
              ...{ show: false },
            },
            [Column.Beacons]: { ...col[Column.Beacons], ...{ show: false } },
            [Column.Pollution]: {
              ...col[Column.Pollution],
              ...{ show: false },
            },
          },
        }
      : game === Game.Satisfactory
      ? {
          ...initialColumnsState,
          ...col,
          ...{
            [Column.Beacons]: { ...col[Column.Beacons], ...{ show: false } },
            [Column.Pollution]: {
              ...col[Column.Pollution],
              ...{ show: false },
            },
          },
        }
      : {
          ...initialColumnsState,
          ...col,
          ...{
            [Column.Overclock]: {
              ...col[Column.Overclock],
              ...{ show: false },
            },
          },
        }
);

export const getLinkPrecision = createSelector(
  getLinkText,
  getColumns,
  (linkText, columns) => {
    switch (linkText) {
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

import { createSelector } from '@ngrx/store';

import {
  Column,
  Entities,
  Game,
  LinkValue,
  PowerUnit,
  PrecisionColumns,
  Rational,
  Step,
} from '~/models';
import { LabState } from '../';
import * as Products from '../products';
import * as Settings from '../settings';
import {
  ColumnsState,
  initialColumnsState,
  PreferencesState,
} from './preferences.reducer';

/* Base selector functions */
export const preferencesState = (state: LabState): PreferencesState =>
  state.preferencesState;
export const getColumns = createSelector(
  preferencesState,
  (state) => state.columns
);
export const getLinkSize = createSelector(
  preferencesState,
  (state) => state.linkSize
);
export const getLinkText = createSelector(
  preferencesState,
  (state) => state.linkText
);
export const getSankeyAlign = createSelector(
  preferencesState,
  (state) => state.sankeyAlign
);
export const getSimplex = createSelector(
  preferencesState,
  (state) => state.simplex
);
export const getPowerUnit = createSelector(
  preferencesState,
  (state) => state.powerUnit
);

/** Complex selectors */
export const getColumnsState = createSelector(
  getColumns,
  Settings.getGame,
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

export const getSimplexModifiers = createSelector(
  getSimplex,
  Settings.getRationalCostInput,
  Settings.getRationalCostIgnored,
  (simplex, costInput, costIgnored) => ({
    simplex,
    costInput,
    costIgnored,
  })
);

export const getEffectivePrecision = createSelector(
  getColumnsState,
  Products.getSteps,
  (columns, steps) => {
    const effPrecision: Entities<number | null> = {};
    effPrecision[Column.Surplus] = effPrecFrom(
      steps,
      columns[Column.Items].precision,
      (s) => s.surplus
    );

    for (const i of PrecisionColumns.filter((i) => columns[i].show)) {
      effPrecision[i] = effPrecFrom(steps, columns[i].precision, (s) =>
        i === Column.Items
          ? (s.items || Rational.zero).sub(s.surplus || Rational.zero)
          : (s as Record<string, any>)[i.toLowerCase()]
      );
    }

    return effPrecision;
  }
);

export const getEffectivePowerUnit = createSelector(
  getPowerUnit,
  Products.getSteps,
  (powerUnit, steps) => {
    if (powerUnit === PowerUnit.Auto) {
      let minPower: Rational | undefined;
      for (const step of steps.filter((s) => s.power != null)) {
        if (minPower == null || step.power!.lt(minPower)) {
          minPower = step.power;
        }
      }
      minPower = minPower ?? Rational.zero;
      if (minPower.lt(Rational.thousand)) {
        return PowerUnit.kW;
      } else if (minPower.lt(Rational.million)) {
        return PowerUnit.MW;
      } else {
        return PowerUnit.GW;
      }
    } else {
      return powerUnit;
    }
  }
);

export function effPrecFrom(
  steps: Step[],
  precision: number | null,
  fn: (step: Step) => Rational | undefined
): number | null {
  if (precision == null) {
    return precision;
  }
  let max = 0;
  for (const step of steps) {
    const dec = fn(step)?.toDecimals() ?? 0;
    if (dec >= precision) {
      return precision;
    } else if (dec > max) {
      max = dec;
    }
  }
  return max;
}

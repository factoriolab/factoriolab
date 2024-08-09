import { createAction, props } from '@ngrx/store';

const key = '[Items]';
export const setExcluded = createAction(
  `${key} Set Excluded`,
  props<{ id: string; value: boolean }>(),
);
export const setExcludedBatch = createAction(
  `${key} Set Excluded Batch`,
  props<{ values: { id: string; value: boolean }[] }>(),
);
export const setChecked = createAction(
  `${key} Set Checked`,
  props<{ id: string; value: boolean }>(),
);
export const setBelt = createAction(
  `${key} Set Belt`,
  props<{ id: string; value: string; def: string | undefined }>(),
);
export const setWagon = createAction(
  `${key} Set Wagon`,
  props<{ id: string; value: string; def: string | undefined }>(),
);
export const resetItem = createAction(
  `${key} Reset Item`,
  props<{ id: string }>(),
);
export const resetExcluded = createAction(`${key} Reset Excluded`);
export const resetChecked = createAction(`${key} Reset Checked`);
export const resetBelts = createAction(`${key} Reset Belts`);
export const resetWagons = createAction(`${key} Reset Wagons`);

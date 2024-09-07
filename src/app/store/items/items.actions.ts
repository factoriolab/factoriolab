import { createAction, props } from '@ngrx/store';

const key = '[Items]';
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
export const resetBelts = createAction(`${key} Reset Belts`);
export const resetWagons = createAction(`${key} Reset Wagons`);

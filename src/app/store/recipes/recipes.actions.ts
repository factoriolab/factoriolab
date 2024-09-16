import { createAction, props } from '@ngrx/store';

import { Rational } from '~/models/rational';
import { BeaconSettings } from '~/models/settings/beacon-settings';
import { ModuleSettings } from '~/models/settings/module-settings';

const key = '[Recipes]';
export const setMachine = createAction(
  `${key} Set Machine`,
  props<{ id: string; value: string; def: string | undefined }>(),
);
export const setFuel = createAction(
  `${key} Set Fuel`,
  props<{ id: string; value: string; def: string | undefined }>(),
);
export const setModules = createAction(
  `${key} Set Modules`,
  props<{ id: string; value: ModuleSettings[] | undefined }>(),
);
export const setBeacons = createAction(
  `${key} Set Beacons`,
  props<{ id: string; value: BeaconSettings[] | undefined }>(),
);
export const setOverclock = createAction(
  `${key} Set Overclock`,
  props<{ id: string; value: Rational; def: Rational | undefined }>(),
);
export const setCost = createAction(
  `${key} Set Cost`,
  props<{ id: string; value: Rational | undefined }>(),
);
export const resetRecipe = createAction(
  `${key} Reset Recipe`,
  props<{ id: string }>(),
);
export const resetRecipeMachines = createAction(
  `${key} Reset Recipe Machines`,
  props<{ ids: string[] }>(),
);
export const resetMachines = createAction(`${key} Reset Machines`);
export const resetBeacons = createAction(`${key} Reset Beacons`);
export const resetCost = createAction(`${key} Reset Cost`);

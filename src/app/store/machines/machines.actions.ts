import { createAction, props } from '@ngrx/store';

import { BeaconSettings, ModuleSettings, Rational } from '~/models';

const key = '[Machines]';
export const setFuelRank = createAction(
  `${key} Set Fuel Rank`,
  props<{ value: string[]; def: string[] | undefined }>(),
);
export const setModuleRank = createAction(
  `${key} Set Module Rank`,
  props<{ value: string[]; def: string[] | undefined }>(),
);
export const setDefaultBeacons = createAction(
  `${key} Set Default Beacons`,
  props<{ beacons: BeaconSettings[] | undefined }>(),
);
export const setDefaultOverclock = createAction(
  `${key} Set Default Overclock`,
  props<{ overclock: Rational | undefined }>(),
);
export const add = createAction(
  `${key} Add`,
  props<{ id: string; def: string[] | undefined }>(),
);
export const remove = createAction(
  `${key} Remove`,
  props<{ id: string; def: string[] | undefined }>(),
);
export const setRank = createAction(
  `${key} Set Rank`,
  props<{ value: string[]; def: string[] | undefined }>(),
);
export const setMachine = createAction(
  `${key} Set Machine`,
  props<{ id: string; value: string; def: string[] | undefined }>(),
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
export const resetMachine = createAction(
  `${key} Reset Machine`,
  props<{ id: string }>(),
);

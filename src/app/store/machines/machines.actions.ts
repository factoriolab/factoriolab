import { createAction, props } from '@ngrx/store';

import { BeaconSettings, ModuleSettings, Rational } from '~/models';

const key = '[Machines]';
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

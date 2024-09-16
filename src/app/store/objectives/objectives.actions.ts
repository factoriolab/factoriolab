import { createAction, props } from '@ngrx/store';

import { ObjectiveType } from '~/models/enum/objective-type';
import { Objective, ObjectiveBase } from '~/models/objective';
import { Rational } from '~/models/rational';
import { BeaconSettings } from '~/models/settings/beacon-settings';
import { ModuleSettings } from '~/models/settings/module-settings';

const key = '[Objectives]';
export const add = createAction(
  `${key} Add`,
  props<{ objective: ObjectiveBase }>(),
);
export const create = createAction(
  `${key} Create`,
  props<{ objective: Objective }>(),
);
export const remove = createAction(`${key} Remove`, props<{ id: string }>());
export const setOrder = createAction(
  `${key} Set Order`,
  props<{ ids: string[] }>(),
);
export const setTarget = createAction(
  `${key} Set Target`,
  props<{ id: string; value: string }>(),
);
export const setValue = createAction(
  `${key} Set Value`,
  props<{ id: string; value: Rational }>(),
);
export const setUnit = createAction(
  `${key} Set Unit`,
  props<{ id: string; objective: ObjectiveBase }>(),
);
export const setType = createAction(
  `${key} Set Type`,
  props<{ id: string; value: ObjectiveType }>(),
);
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
export const resetObjective = createAction(
  `${key} Reset Objective`,
  props<{ id: string }>(),
);
export const adjustDisplayRate = createAction(
  `${key} Adjust Display Rate`,
  props<{ factor: Rational }>(),
);

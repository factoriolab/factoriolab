import { createAction, props } from '@ngrx/store';

import {
  CostSettings,
  DisplayRate,
  InserterCapacity,
  InserterTarget,
  MaximizeType,
  Preset,
  Rational,
} from '~/models';

const key = '[Settings]';
export const setMod = createAction(
  `${key} Set Mod`,
  props<{ modId: string }>(),
);
export const setResearchedTechnologies = createAction(
  `${key} Set Researched Technologies`,
  props<{ researchedTechnologyIds: string[] | null }>(),
);
export const setNetProductionOnly = createAction(
  `${key} Set Net Production Only`,
  props<{ netProductionOnly: boolean }>(),
);
export const setSurplusMachinesOutput = createAction(
  `${key} Set Surplus Machines Output`,
  props<{ surplusMachinesOutput: boolean }>(),
);
export const setPreset = createAction(
  `${key} Set Preset`,
  props<{ preset: Preset }>(),
);
export const setBeaconReceivers = createAction(
  `${key} Set Beacon Receivers`,
  props<{ beaconReceivers: Rational | null }>(),
);
export const setProliferatorSpray = createAction(
  `${key} Set Proliferator Spray`,
  props<{ proliferatorSprayId: string }>(),
);
export const setBelt = createAction(
  `${key} Set Belt`,
  props<{ id: string; def: string | undefined }>(),
);
export const setPipe = createAction(
  `${key} Set Pipe`,
  props<{ id: string; def: string | undefined }>(),
);
export const setCargoWagon = createAction(
  `${key} Set Cargo Wagon`,
  props<{ id: string; def: string | undefined }>(),
);
export const setFluidWagon = createAction(
  `${key} Set Fluid Wagon`,
  props<{ id: string; def: string | undefined }>(),
);
export const setFlowRate = createAction(
  `${key} Set Flow Rate`,
  props<{ flowRate: Rational }>(),
);
export const setInserterTarget = createAction(
  `${key} Set Inserter Target`,
  props<{ inserterTarget: InserterTarget }>(),
);
export const setMiningBonus = createAction(
  `${key} Set Mining Bonus`,
  props<{ miningBonus: Rational }>(),
);
export const setResearchBonus = createAction(
  `${key} Set Research Bonus`,
  props<{ researchBonus: Rational }>(),
);
export const setInserterCapacity = createAction(
  `${key} Set Inserter Capacity`,
  props<{ inserterCapacity: InserterCapacity }>(),
);
export const setDisplayRate = createAction(
  `${key} Set Display Rate`,
  props<{ displayRate: DisplayRate; previous: DisplayRate }>(),
);
export const setMaximizeType = createAction(
  `${key} Set Maximize Type`,
  props<{ maximizeType: MaximizeType }>(),
);
export const setCosts = createAction(
  `${key} Set Costs`,
  props<{ costs: CostSettings }>(),
);
export const resetCosts = createAction(`${key} Reset Costs`);

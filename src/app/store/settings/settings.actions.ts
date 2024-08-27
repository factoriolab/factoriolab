import { createAction, props } from '@ngrx/store';

import {
  BeaconSettings,
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
export const setCheckedObjectives = createAction(
  `${key} Set Checked Objectives`,
  props<{ checkedObjectiveIds: Set<string> }>(),
);
export const setMaximizeType = createAction(
  `${key} Set Maximize Type`,
  props<{ maximizeType: MaximizeType }>(),
);
export const setSurplusMachinesOutput = createAction(
  `${key} Set Surplus Machines Output`,
  props<{ surplusMachinesOutput: boolean }>(),
);
export const setDisplayRate = createAction(
  `${key} Set Display Rate`,
  props<{ displayRate: DisplayRate; previous: DisplayRate }>(),
);
export const setExcludedItems = createAction(
  `${key} Set Excluded Items`,
  props<{ excludedItemIds: Set<string> }>(),
);
export const setCheckedItems = createAction(
  `${key} Set Checked Items`,
  props<{ checkedItemIds: Set<string> }>(),
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
export const setExcludedRecipes = createAction(
  `${key} Set Excluded Recipes`,
  props<{ value: Set<string>; def: Set<string> }>(),
);
export const setCheckedRecipes = createAction(
  `${key} Set Checked Recipes`,
  props<{ checkedRecipeIds: Set<string> }>(),
);
export const setNetProductionOnly = createAction(
  `${key} Set Net Production Only`,
  props<{ netProductionOnly: boolean }>(),
);
export const setPreset = createAction(
  `${key} Set Preset`,
  props<{ preset: Preset }>(),
);
export const setMachineRank = createAction(
  `${key} Set Machine Rank`,
  props<{ value: string[]; def: string[] | undefined }>(),
);
export const setFuelRank = createAction(
  `${key} Set Fuel Rank`,
  props<{ value: string[]; def: string[] | undefined }>(),
);
export const setModuleRank = createAction(
  `${key} Set Module Rank`,
  props<{ value: string[]; def: string[] | undefined }>(),
);
export const setBeacons = createAction(
  `${key} Set Beacons`,
  props<{ beacons: BeaconSettings[] | undefined }>(),
);
export const setOverclock = createAction(
  `${key} Set Overclock`,
  props<{ overclock: Rational | undefined }>(),
);
export const setBeaconReceivers = createAction(
  `${key} Set Beacon Receivers`,
  props<{ beaconReceivers: Rational | null }>(),
);
export const setProliferatorSpray = createAction(
  `${key} Set Proliferator Spray`,
  props<{ proliferatorSprayId: string }>(),
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
export const setResearchedTechnologies = createAction(
  `${key} Set Researched Technologies`,
  props<{ researchedTechnologyIds: Set<string> | null }>(),
);
export const setCosts = createAction(
  `${key} Set Costs`,
  props<{ costs: CostSettings }>(),
);
export const resetExcludedItems = createAction(`${key} Reset Excluded Items`);
export const resetChecked = createAction(`${key} Reset Checked`);
export const resetCosts = createAction(`${key} Reset Costs`);

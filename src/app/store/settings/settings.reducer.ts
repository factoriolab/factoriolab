import { createReducer, on } from '@ngrx/store';

import { spread } from '~/helpers';
import { DisplayRate } from '~/models/enum/display-rate';
import { InserterCapacity } from '~/models/enum/inserter-capacity';
import { InserterTarget } from '~/models/enum/inserter-target';
import { ItemId } from '~/models/enum/item-id';
import { MaximizeType } from '~/models/enum/maximize-type';
import { Preset } from '~/models/enum/preset';
import { researchBonusValue } from '~/models/enum/research-bonus';
import { Rational, rational } from '~/models/rational';
import { BeaconSettings } from '~/models/settings/beacon-settings';
import { CostSettings } from '~/models/settings/cost-settings';
import { StoreUtility } from '~/utilities/store.utility';

import { load, reset } from '../app.actions';
import {
  resetChecked,
  resetCosts,
  resetExcludedItems,
  setBeaconReceivers,
  setBeacons,
  setBelt,
  setCargoWagon,
  setCheckedItems,
  setCheckedObjectives,
  setCheckedRecipes,
  setCosts,
  setDisplayRate,
  setExcludedItems,
  setExcludedRecipes,
  setFlowRate,
  setFluidWagon,
  setFuelRank,
  setInserterCapacity,
  setInserterTarget,
  setMachineRank,
  setMaximizeType,
  setMiningBonus,
  setMod,
  setModuleRank,
  setNetProductionOnly,
  setOverclock,
  setPipe,
  setPreset,
  setProliferatorSpray,
  setResearchBonus,
  setResearchedTechnologies,
  setSurplusMachinesOutput,
} from './settings.actions';

export interface SettingsState {
  modId: string;
  checkedObjectiveIds: Set<string>;
  maximizeType: MaximizeType;
  surplusMachinesOutput: boolean;
  displayRate: DisplayRate;
  excludedItemIds: Set<string>;
  checkedItemIds: Set<string>;
  beltId?: string;
  pipeId?: string;
  cargoWagonId?: string;
  fluidWagonId?: string;
  flowRate: Rational;
  excludedRecipeIds?: Set<string>;
  checkedRecipeIds: Set<string>;
  netProductionOnly: boolean;
  preset: Preset;
  machineRankIds?: string[];
  fuelRankIds?: string[];
  moduleRankIds?: string[];
  beacons?: BeaconSettings[];
  overclock?: Rational;
  beaconReceivers?: Rational;
  proliferatorSprayId: string;
  inserterTarget: InserterTarget;
  miningBonus: Rational;
  researchBonus: Rational;
  inserterCapacity: InserterCapacity;
  researchedTechnologyIds?: Set<string>;
  costs: CostSettings;
}

export type PartialSettingsState = Partial<Omit<SettingsState, 'costs'>> & {
  costs?: Partial<CostSettings>;
};

export const initialSettingsState: SettingsState = {
  modId: '1.1',
  checkedObjectiveIds: new Set(),
  preset: Preset.Minimum,
  maximizeType: MaximizeType.Weight,
  surplusMachinesOutput: false,
  displayRate: DisplayRate.PerMinute,
  excludedItemIds: new Set(),
  checkedItemIds: new Set(),
  flowRate: rational(1200n),
  checkedRecipeIds: new Set(),
  netProductionOnly: false,
  proliferatorSprayId: ItemId.Module,
  inserterTarget: InserterTarget.ExpressTransportBelt,
  miningBonus: rational.zero,
  researchBonus: researchBonusValue.speed6,
  inserterCapacity: InserterCapacity.Capacity7,
  costs: {
    factor: rational.one,
    machine: rational.one,
    footprint: rational.one,
    unproduceable: rational(1000000n),
    excluded: rational.zero,
    surplus: rational.zero,
    maximize: rational(-1000000n),
  },
};

export const settingsReducer = createReducer(
  initialSettingsState,
  on(
    load,
    (_, { partial }): SettingsState =>
      spread(
        initialSettingsState,
        spread(partial.settingsState ?? {}, {
          costs: spread(
            initialSettingsState.costs,
            partial.settingsState?.costs ?? {},
          ),
        }) as Partial<SettingsState>,
      ),
  ),
  on(reset, (): SettingsState => initialSettingsState),
  on(setMod, (state, { modId }) => {
    state = spread(state, {
      modId,
      researchedTechnologyIds: initialSettingsState.researchedTechnologyIds,
      preset: initialSettingsState.preset,
      miningBonus: initialSettingsState.miningBonus,
      researchBonus: initialSettingsState.researchBonus,
    });

    delete state.beltId;
    delete state.pipeId;
    delete state.cargoWagonId;
    delete state.fluidWagonId;

    return state;
  }),
  on(setMachineRank, (state, { value, def }) =>
    spread(state, { machineRankIds: StoreUtility.compareRank(value, def) }),
  ),
  on(setFuelRank, (state, { value, def }) =>
    spread(state, { fuelRankIds: StoreUtility.compareRank(value, def) }),
  ),
  on(setModuleRank, (state, { value, def }) =>
    spread(state, { moduleRankIds: StoreUtility.compareRank(value, def) }),
  ),
  on(setBelt, (state, { id, def }) =>
    spread(state, { beltId: StoreUtility.compareValue(id, def) }),
  ),
  on(setPipe, (state, { id, def }) =>
    spread(state, { pipeId: StoreUtility.compareValue(id, def) }),
  ),
  on(setCargoWagon, (state, { id, def }) =>
    spread(state, { cargoWagonId: StoreUtility.compareValue(id, def) }),
  ),
  on(setFluidWagon, (state, { id, def }) =>
    spread(state, { fluidWagonId: StoreUtility.compareValue(id, def) }),
  ),
  on(setExcludedRecipes, (state, { value, def }) =>
    spread(state, { excludedRecipeIds: StoreUtility.compareSet(value, def) }),
  ),
  on(
    setCheckedObjectives,
    setPreset,
    setMaximizeType,
    setSurplusMachinesOutput,
    setDisplayRate,
    setExcludedItems,
    setCheckedItems,
    setFlowRate,
    setCheckedRecipes,
    setNetProductionOnly,
    setBeacons,
    setOverclock,
    setBeaconReceivers,
    setProliferatorSpray,
    setInserterTarget,
    setMiningBonus,
    setResearchBonus,
    setInserterCapacity,
    setResearchedTechnologies,
    setCosts,
    (state, payload) => spread(state, payload),
  ),
  on(resetExcludedItems, (state) =>
    spread(state, { excludedItemIds: initialSettingsState.excludedItemIds }),
  ),
  on(resetChecked, (state) =>
    spread(state, {
      checkedItemIds: initialSettingsState.checkedItemIds,
      checkedRecipeIds: initialSettingsState.checkedRecipeIds,
      checkedObjectiveIds: initialSettingsState.checkedObjectiveIds,
    }),
  ),
  on(resetCosts, (state) =>
    spread(state, { costs: initialSettingsState.costs }),
  ),
);

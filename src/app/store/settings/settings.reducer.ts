import { createReducer, on } from '@ngrx/store';

import { spread } from '~/helpers';
import {
  BeaconSettings,
  CostSettings,
  DisplayRate,
  InserterCapacity,
  InserterTarget,
  ItemId,
  MaximizeType,
  Preset,
  Rational,
  rational,
  researchBonusValue,
} from '~/models';
import { StoreUtility } from '~/utilities';
import * as App from '../app.actions';
import * as Actions from './settings.actions';

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

export const initialState: SettingsState = {
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
  initialState,
  on(
    App.load,
    (_, { partial }): SettingsState =>
      spread(
        initialState,
        spread(partial.settingsState ?? {}, {
          costs: spread(initialState.costs, partial.settingsState?.costs ?? {}),
        }) as Partial<SettingsState>,
      ),
  ),
  on(App.reset, (): SettingsState => initialState),
  on(Actions.setMod, (state, { modId }) => {
    state = spread(state, {
      modId,
      researchedTechnologyIds: initialState.researchedTechnologyIds,
      preset: initialState.preset,
      miningBonus: initialState.miningBonus,
      researchBonus: initialState.researchBonus,
    });

    delete state.beltId;
    delete state.pipeId;
    delete state.cargoWagonId;
    delete state.fluidWagonId;

    return state;
  }),
  on(Actions.setMachineRank, (state, { value, def }) =>
    spread(state, { machineRankIds: StoreUtility.compareRank(value, def) }),
  ),
  on(Actions.setFuelRank, (state, { value, def }) =>
    spread(state, { fuelRankIds: StoreUtility.compareRank(value, def) }),
  ),
  on(Actions.setModuleRank, (state, { value, def }) =>
    spread(state, { moduleRankIds: StoreUtility.compareRank(value, def) }),
  ),
  on(Actions.setBelt, (state, { id, def }) =>
    spread(state, { beltId: StoreUtility.compareValue(id, def) }),
  ),
  on(Actions.setPipe, (state, { id, def }) =>
    spread(state, { pipeId: StoreUtility.compareValue(id, def) }),
  ),
  on(Actions.setCargoWagon, (state, { id, def }) =>
    spread(state, { cargoWagonId: StoreUtility.compareValue(id, def) }),
  ),
  on(Actions.setFluidWagon, (state, { id, def }) =>
    spread(state, { fluidWagonId: StoreUtility.compareValue(id, def) }),
  ),
  on(Actions.setExcludedRecipes, (state, { value, def }) =>
    spread(state, { excludedRecipeIds: StoreUtility.compareSet(value, def) }),
  ),
  on(
    Actions.setCheckedObjectives,
    Actions.setPreset,
    Actions.setMaximizeType,
    Actions.setSurplusMachinesOutput,
    Actions.setDisplayRate,
    Actions.setExcludedItems,
    Actions.setCheckedItems,
    Actions.setFlowRate,
    Actions.setCheckedRecipes,
    Actions.setNetProductionOnly,
    Actions.setBeacons,
    Actions.setOverclock,
    Actions.setBeaconReceivers,
    Actions.setProliferatorSpray,
    Actions.setInserterTarget,
    Actions.setMiningBonus,
    Actions.setResearchBonus,
    Actions.setInserterCapacity,
    Actions.setResearchedTechnologies,
    Actions.setCosts,
    (state, payload) => spread(state, payload),
  ),
  on(Actions.resetExcludedItems, (state) =>
    spread(state, { excludedItemIds: initialState.excludedItemIds }),
  ),
  on(Actions.resetChecked, (state) =>
    spread(state, {
      checkedItemIds: initialState.checkedItemIds,
      checkedRecipeIds: initialState.checkedRecipeIds,
      checkedObjectiveIds: initialState.checkedObjectiveIds,
    }),
  ),
  on(Actions.resetCosts, (state) =>
    spread(state, { costs: initialState.costs }),
  ),
);

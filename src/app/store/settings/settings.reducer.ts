import { createReducer, on } from '@ngrx/store';

import { spread } from '~/helpers';
import {
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
  /**
   * Use null value to indicate all researched. This list is filtered to the
   * minimal set of technologies not listed as prerequisites for other
   * researched technologies, to reduce zip size.
   */
  researchedTechnologyIds: string[] | null;
  netProductionOnly: boolean;
  surplusMachinesOutput: boolean;
  preset: Preset;
  beaconReceivers: Rational | null;
  proliferatorSprayId: string;
  beltId?: string;
  pipeId?: string;
  cargoWagonId?: string;
  fluidWagonId?: string;
  flowRate: Rational;
  inserterTarget: InserterTarget;
  miningBonus: Rational;
  researchBonus: Rational;
  inserterCapacity: InserterCapacity;
  displayRate: DisplayRate;
  costs: CostSettings;
  maximizeType: MaximizeType;
}

export type PartialSettingsState = Partial<Omit<SettingsState, 'costs'>> & {
  costs?: Partial<CostSettings>;
};

export const initialState: SettingsState = {
  modId: '1.1',
  researchedTechnologyIds: null,
  netProductionOnly: false,
  surplusMachinesOutput: false,
  preset: Preset.Minimum,
  beaconReceivers: null,
  proliferatorSprayId: ItemId.Module,
  flowRate: rational(1200n),
  inserterTarget: InserterTarget.ExpressTransportBelt,
  miningBonus: rational.zero,
  researchBonus: researchBonusValue.speed6,
  inserterCapacity: InserterCapacity.Capacity7,
  displayRate: DisplayRate.PerMinute,
  maximizeType: MaximizeType.Weight,
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
  on(
    Actions.setResearchedTechnologies,
    Actions.setNetProductionOnly,
    Actions.setSurplusMachinesOutput,
    Actions.setPreset,
    Actions.setBeaconReceivers,
    Actions.setProliferatorSpray,
    Actions.setFlowRate,
    Actions.setInserterTarget,
    Actions.setMiningBonus,
    Actions.setResearchBonus,
    Actions.setInserterCapacity,
    Actions.setDisplayRate,
    Actions.setMaximizeType,
    Actions.setCosts,
    (state, payload) => spread(state, payload),
  ),
  on(Actions.resetCosts, (state) =>
    spread(state, { costs: initialState.costs }),
  ),
);

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
  researchBonus,
} from '~/models';
import { StoreUtility } from '~/utilities';
import * as App from '../app.actions';
import { SettingsAction, SettingsActionType } from './settings.actions';

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

export const initialSettingsState: SettingsState = {
  modId: '1.1',
  researchedTechnologyIds: null,
  netProductionOnly: false,
  surplusMachinesOutput: false,
  preset: Preset.Minimum,
  beaconReceivers: null,
  proliferatorSprayId: ItemId.Module,
  flowRate: rational(1200n),
  inserterTarget: InserterTarget.ExpressTransportBelt,
  miningBonus: rational(0n),
  researchBonus: researchBonus.speed6,
  inserterCapacity: InserterCapacity.Capacity7,
  displayRate: DisplayRate.PerMinute,
  maximizeType: MaximizeType.Weight,
  costs: {
    factor: rational(1n),
    machine: rational(1n),
    footprint: rational(1n),
    unproduceable: rational(1000000n),
    excluded: rational(0n),
    surplus: rational(0n),
    maximize: rational(-1000000n),
  },
};

export function settingsReducer(
  state: SettingsState = initialSettingsState,
  action: SettingsAction | App.AppAction,
): SettingsState {
  switch (action.type) {
    case App.AppActionType.LOAD:
      return action.payload.settingsState
        ? {
            ...initialSettingsState,
            ...{
              ...action.payload.settingsState,
              ...{
                costs: {
                  ...initialSettingsState.costs,
                  ...action.payload.settingsState.costs,
                },
              },
            },
          }
        : initialSettingsState;
    case App.AppActionType.RESET:
      return initialSettingsState;
    case SettingsActionType.SET_MOD: {
      state = spread(state, {
        modId: action.payload,
        preset: initialSettingsState.preset,
        beaconReceivers: initialSettingsState.beaconReceivers,
        miningBonus: initialSettingsState.miningBonus,
        researchBonus: initialSettingsState.researchBonus,
      });

      delete state.beltId;
      delete state.pipeId;
      delete state.cargoWagonId;
      delete state.fluidWagonId;
      return state;
    }
    case SettingsActionType.SET_RESEARCHED_TECHNOLOGIES:
      return spread(state, { researchedTechnologyIds: action.payload });
    case SettingsActionType.SET_NET_PRODUCTION_ONLY:
      return spread(state, { netProductionOnly: action.payload });
    case SettingsActionType.SET_REQUIRE_MACHINES_OUTPUT:
      return spread(state, { surplusMachinesOutput: action.payload });
    case SettingsActionType.SET_PRESET:
      return spread(state, { preset: action.payload });
    case SettingsActionType.SET_BEACON_RECEIVERS:
      return spread(state, { beaconReceivers: action.payload });
    case SettingsActionType.SET_PROLIFERATOR_SPRAY:
      return spread(state, { proliferatorSprayId: action.payload });
    case SettingsActionType.SET_BELT:
      return spread(state, {
        beltId: StoreUtility.compareValue(action.payload),
      });
    case SettingsActionType.SET_PIPE:
      return spread(state, {
        pipeId: StoreUtility.compareValue(action.payload),
      });
    case SettingsActionType.SET_CARGO_WAGON:
      return spread(state, {
        cargoWagonId: StoreUtility.compareValue(action.payload),
      });
    case SettingsActionType.SET_FLUID_WAGON:
      return spread(state, {
        fluidWagonId: StoreUtility.compareValue(action.payload),
      });
    case SettingsActionType.SET_FLOW_RATE:
      return spread(state, { flowRate: action.payload });
    case SettingsActionType.SET_INSERTER_TARGET:
      return spread(state, { inserterTarget: action.payload });
    case SettingsActionType.SET_MINING_BONUS:
      return spread(state, { miningBonus: action.payload });
    case SettingsActionType.SET_RESEARCH_BONUS:
      return spread(state, { researchBonus: action.payload });
    case SettingsActionType.SET_INSERTER_CAPACITY:
      return spread(state, { inserterCapacity: action.payload });
    case SettingsActionType.SET_DISPLAY_RATE:
      return spread(state, { displayRate: action.payload.value });
    case SettingsActionType.SET_MAXIMIZE_TYPE:
      return spread(state, { maximizeType: action.payload });
    case SettingsActionType.SET_COSTS:
      return spread(state, { costs: action.payload });
    case SettingsActionType.RESET_COSTS:
      return spread(state, {
        costs: initialSettingsState.costs,
      });
    default:
      return state;
  }
}

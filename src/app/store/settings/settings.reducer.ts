import {
  CostSettings,
  DisplayRate,
  InserterCapacity,
  InserterTarget,
  ItemId,
  MaximizeType,
  Preset,
  ResearchSpeed,
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
  beaconReceivers: string | null;
  proliferatorSprayId: string;
  beltId?: string;
  pipeId?: string;
  fuelRankIds?: string[];
  cargoWagonId?: string;
  fluidWagonId?: string;
  flowRate: number;
  inserterTarget: InserterTarget;
  miningBonus: number;
  researchSpeed: ResearchSpeed;
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
  flowRate: 1200,
  inserterTarget: InserterTarget.ExpressTransportBelt,
  miningBonus: 0,
  researchSpeed: ResearchSpeed.Speed6,
  inserterCapacity: InserterCapacity.Capacity7,
  displayRate: DisplayRate.PerMinute,
  maximizeType: MaximizeType.Weight,
  costs: {
    factor: '1',
    machine: '1',
    footprint: '1',
    unproduceable: '1000000',
    excluded: '0',
    surplus: '0',
    maximize: '-1000000',
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
      const newState = {
        ...state,
        ...{
          modId: action.payload,
          preset: Preset.Minimum,
          beaconReceivers: null,
          miningBonus: 0,
          researchSpeed: ResearchSpeed.Speed6,
        },
      };
      delete newState.beltId;
      delete newState.pipeId;
      delete newState.fuelRankIds;
      delete newState.cargoWagonId;
      delete newState.fluidWagonId;
      return newState;
    }
    case SettingsActionType.SET_RESEARCHED_TECHNOLOGIES:
      return { ...state, ...{ researchedTechnologyIds: action.payload } };
    case SettingsActionType.SET_NET_PRODUCTION_ONLY:
      return { ...state, ...{ netProductionOnly: action.payload } };
    case SettingsActionType.SET_REQUIRE_MACHINES_OUTPUT:
      return { ...state, ...{ surplusMachinesOutput: action.payload } };
    case SettingsActionType.SET_PRESET:
      return { ...state, ...{ preset: action.payload } };
    case SettingsActionType.SET_BEACON_RECEIVERS:
      return { ...state, ...{ beaconReceivers: action.payload } };
    case SettingsActionType.SET_PROLIFERATOR_SPRAY:
      return { ...state, ...{ proliferatorSprayId: action.payload } };
    case SettingsActionType.SET_BELT:
      return {
        ...state,
        ...{ beltId: StoreUtility.compareValue(action.payload) },
      };
    case SettingsActionType.SET_PIPE:
      return {
        ...state,
        ...{ pipeId: StoreUtility.compareValue(action.payload) },
      };
    case SettingsActionType.SET_FUEL_RANK:
      return {
        ...state,
        ...{ fuelRankIds: StoreUtility.compareValue(action.payload) },
      };
    case SettingsActionType.SET_CARGO_WAGON:
      return {
        ...state,
        ...{ cargoWagonId: StoreUtility.compareValue(action.payload) },
      };
    case SettingsActionType.SET_FLUID_WAGON:
      return {
        ...state,
        ...{ fluidWagonId: StoreUtility.compareValue(action.payload) },
      };
    case SettingsActionType.SET_FLOW_RATE:
      return { ...state, ...{ flowRate: action.payload } };
    case SettingsActionType.SET_INSERTER_TARGET:
      return { ...state, ...{ inserterTarget: action.payload } };
    case SettingsActionType.SET_MINING_BONUS:
      return { ...state, ...{ miningBonus: action.payload } };
    case SettingsActionType.SET_RESEARCH_SPEED:
      return { ...state, ...{ researchSpeed: action.payload } };
    case SettingsActionType.SET_INSERTER_CAPACITY:
      return { ...state, ...{ inserterCapacity: action.payload } };
    case SettingsActionType.SET_DISPLAY_RATE:
      return { ...state, ...{ displayRate: action.payload.value } };
    case SettingsActionType.SET_MAXIMIZE_TYPE:
      return { ...state, ...{ maximizeType: action.payload } };
    case SettingsActionType.SET_COSTS:
      return { ...state, ...{ costs: action.payload } };
    case SettingsActionType.RESET_COST:
      return {
        ...state,
        ...{
          costs: initialSettingsState.costs,
        },
      };
    default:
      return state;
  }
}

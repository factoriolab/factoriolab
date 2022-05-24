import {
  DisplayRate,
  InserterCapacity,
  InserterTarget,
  ItemId,
  Preset,
  ResearchSpeed,
} from '~/models';
import { StoreUtility } from '~/utilities';
import * as App from '../app.actions';
import { SettingsAction, SettingsActionType } from './settings.actions';

export interface SettingsState {
  modId: string;
  disabledRecipeIds?: string[];
  displayRate: DisplayRate;
  preset: Preset;
  beaconReceivers: string | null;
  beltId?: string;
  pipeId?: string;
  fuelId?: string;
  cargoWagonId?: string;
  fluidWagonId?: string;
  flowRate: number;
  miningBonus: number;
  researchSpeed: ResearchSpeed;
  inserterTarget: InserterTarget;
  inserterCapacity: InserterCapacity;
  costFactor: string;
  costFactory: string;
  costInput: string;
  costIgnored: string;
  proliferatorSprayId: string;
}

export const initialSettingsState: SettingsState = {
  modId: '1.1',
  displayRate: DisplayRate.PerMinute,
  preset: Preset.Minimum,
  beaconReceivers: null,
  flowRate: 1500,
  miningBonus: 0,
  researchSpeed: ResearchSpeed.Speed6,
  inserterTarget: InserterTarget.ExpressTransportBelt,
  inserterCapacity: InserterCapacity.Capacity7,
  costFactor: '1',
  costFactory: '1',
  costInput: '1000000',
  costIgnored: '0',
  proliferatorSprayId: ItemId.Module,
};

export function settingsReducer(
  state: SettingsState = initialSettingsState,
  action: SettingsAction | App.AppAction
): SettingsState {
  switch (action.type) {
    case App.AppActionType.LOAD:
      return action.payload.settingsState
        ? { ...initialSettingsState, ...action.payload.settingsState }
        : initialSettingsState;
    case App.AppActionType.RESET:
      return initialSettingsState;
    case SettingsActionType.SET_PRESET:
      return { ...state, ...{ preset: action.payload } };
    case SettingsActionType.SET_MOD:
      const newState = {
        ...state,
        ...{
          modId: action.payload,
          preset: Preset.Minimum,
          miningBonus: 0,
          researchSpeed: ResearchSpeed.Speed6,
        },
      };
      delete newState.disabledRecipeIds;
      delete newState.beltId;
      delete newState.pipeId;
      delete newState.fuelId;
      delete newState.cargoWagonId;
      delete newState.fluidWagonId;
      return newState;
    case SettingsActionType.SET_DISABLED_RECIPES:
      return {
        ...state,
        ...{
          disabledRecipeIds: StoreUtility.compareValues(action.payload),
        },
      };
    case SettingsActionType.SET_BEACON_RECEIVERS:
      return { ...state, ...{ beaconReceivers: action.payload } };
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
    case SettingsActionType.SET_FUEL:
      return {
        ...state,
        ...{ fuelId: StoreUtility.compareValue(action.payload) },
      };
    case SettingsActionType.SET_FLOW_RATE:
      return { ...state, ...{ flowRate: action.payload } };
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
    case SettingsActionType.SET_DISPLAY_RATE:
      return { ...state, ...{ displayRate: action.payload.value } };
    case SettingsActionType.SET_MINING_BONUS:
      return { ...state, ...{ miningBonus: action.payload } };
    case SettingsActionType.SET_RESEARCH_SPEED:
      return { ...state, ...{ researchSpeed: action.payload } };
    case SettingsActionType.SET_INSERTER_TARGET:
      return { ...state, ...{ inserterTarget: action.payload } };
    case SettingsActionType.SET_INSERTER_CAPACITY:
      return { ...state, ...{ inserterCapacity: action.payload } };
    case SettingsActionType.SET_COST_FACTOR:
      return { ...state, ...{ costFactor: action.payload } };
    case SettingsActionType.SET_COST_FACTORY:
      return { ...state, ...{ costFactory: action.payload } };
    case SettingsActionType.SET_COST_INPUT:
      return { ...state, ...{ costInput: action.payload } };
    case SettingsActionType.SET_COST_IGNORED:
      return { ...state, ...{ costIgnored: action.payload } };
    case SettingsActionType.SET_PROLIFERATOR_SPRAY:
      return { ...state, ...{ proliferatorSprayId: action.payload } };
    case SettingsActionType.RESET_COST:
      return {
        ...state,
        ...{
          costFactor: initialSettingsState.costFactor,
          costFactory: initialSettingsState.costFactory,
          costInput: initialSettingsState.costInput,
          costIgnored: initialSettingsState.costIgnored,
        },
      };
    default:
      return state;
  }
}

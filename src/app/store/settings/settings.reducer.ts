import {
  DisplayRate,
  ResearchSpeed,
  Preset,
  InserterTarget,
  InserterCapacity,
} from '~/models';
import { StoreUtility } from '~/utilities';
import { AppActionType, AppAction } from '../app.actions';
import { SettingsAction, SettingsActionType } from './settings.actions';

export interface SettingsState {
  baseId: string;
  disabledRecipes: string[];
  expensive: boolean;
  displayRate: DisplayRate;
  preset: Preset;
  beaconReceivers: string;
  belt: string;
  pipe: string;
  fuel: string;
  cargoWagon: string;
  fluidWagon: string;
  flowRate: number;
  miningBonus: number;
  researchSpeed: ResearchSpeed;
  inserterTarget: InserterTarget;
  inserterCapacity: InserterCapacity;
  costFactor: string;
  costFactory: string;
  costInput: string;
  costIgnored: string;
}

export const initialSettingsState: SettingsState = {
  baseId: '1.1',
  disabledRecipes: null,
  expensive: false,
  displayRate: DisplayRate.PerMinute,
  preset: Preset.Minimum,
  beaconReceivers: null,
  belt: null,
  pipe: null,
  fuel: null,
  cargoWagon: null,
  fluidWagon: null,
  flowRate: 1500,
  miningBonus: 0,
  researchSpeed: ResearchSpeed.Speed6,
  inserterTarget: InserterTarget.ExpressTransportBelt,
  inserterCapacity: InserterCapacity.Capacity7,
  costFactor: '1',
  costFactory: '1',
  costInput: '1000000',
  costIgnored: '0',
};

export function settingsReducer(
  state: SettingsState = initialSettingsState,
  action: SettingsAction | AppAction
): SettingsState {
  switch (action.type) {
    case AppActionType.LOAD:
      return action.payload.settingsState
        ? { ...initialSettingsState, ...action.payload.settingsState }
        : initialSettingsState;
    case AppActionType.RESET:
      return initialSettingsState;
    case SettingsActionType.SET_PRESET:
      return { ...state, ...{ preset: action.payload } };
    case SettingsActionType.SET_BASE:
      return {
        ...state,
        ...{
          baseId: action.payload,
          disabledRecipes: null,
          expensive: false,
          preset: Preset.Minimum,
          belt: null,
          pipe: null,
          fuel: null,
          cargoWagon: null,
          fluidWagon: null,
          miningBonus: 0,
          researchSpeed: ResearchSpeed.Speed6,
        },
      };
    case SettingsActionType.SET_DISABLED_RECIPES:
      return {
        ...state,
        ...{
          disabledRecipes: StoreUtility.compareValues(action.payload),
        },
      };
    case SettingsActionType.SET_EXPENSIVE:
      return { ...state, ...{ expensive: action.payload } };
    case SettingsActionType.SET_BEACON_RECEIVERS:
      return { ...state, ...{ beaconReceivers: action.payload } };
    case SettingsActionType.SET_BELT:
      return {
        ...state,
        ...{ belt: StoreUtility.compareValue(action.payload) },
      };
    case SettingsActionType.SET_PIPE:
      return {
        ...state,
        ...{ pipe: StoreUtility.compareValue(action.payload) },
      };
    case SettingsActionType.SET_FUEL:
      return {
        ...state,
        ...{ fuel: StoreUtility.compareValue(action.payload) },
      };
    case SettingsActionType.SET_FLOW_RATE:
      return { ...state, ...{ flowRate: action.payload } };
    case SettingsActionType.SET_CARGO_WAGON:
      return {
        ...state,
        ...{ cargoWagon: StoreUtility.compareValue(action.payload) },
      };
    case SettingsActionType.SET_FLUID_WAGON:
      return {
        ...state,
        ...{ fluidWagon: StoreUtility.compareValue(action.payload) },
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

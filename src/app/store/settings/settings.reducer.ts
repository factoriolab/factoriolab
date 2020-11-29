import {
  DisplayRate,
  ResearchSpeed,
  Theme,
  AllColumns,
  Preset,
  Sort,
  LinkValue,
  Entities,
  InserterTarget,
  InserterCapacity,
  SETTINGS_KEY,
} from '~/models';
import { StoreUtility } from '~/utilities';
import { AppLoadAction, AppActionType } from '../app.actions';
import { SettingsAction, SettingsActionType } from './settings.actions';

export interface SettingsState {
  states: Entities<string>;
  preset: Preset;
  baseId: string;
  modIds: string[];
  disabledRecipes: string[];
  expensive: boolean;
  factoryRank: string[];
  moduleRank: string[];
  drillModule: boolean;
  beacon: string;
  beaconModule: string;
  beaconCount: number;
  belt: string;
  fuel: string;
  flowRate: number;
  displayRate: DisplayRate;
  itemPrecision: number;
  beltPrecision: number;
  wagonPrecision: number;
  factoryPrecision: number;
  powerPrecision: number;
  pollutionPrecision: number;
  miningBonus: number;
  researchSpeed: ResearchSpeed;
  inserterTarget: InserterTarget;
  inserterCapacity: InserterCapacity;
  columns?: string[];
  sort?: Sort;
  linkValue?: LinkValue;
  theme?: Theme;
  showHeader?: boolean;
}

export const initialSettingsState: SettingsState = {
  states: {},
  preset: Preset.Minimum,
  baseId: '1.1',
  modIds: null,
  disabledRecipes: null,
  expensive: false,
  factoryRank: null,
  moduleRank: null,
  drillModule: false,
  beacon: null,
  beaconModule: null,
  beaconCount: null,
  belt: null,
  fuel: null,
  flowRate: 1500,
  displayRate: DisplayRate.PerMinute,
  itemPrecision: 3,
  beltPrecision: 1,
  wagonPrecision: 1,
  factoryPrecision: 1,
  powerPrecision: 1,
  pollutionPrecision: 1,
  miningBonus: 0,
  researchSpeed: ResearchSpeed.Speed6,
  inserterTarget: InserterTarget.ExpressTransportBelt,
  inserterCapacity: InserterCapacity.Capacity7,
  columns: AllColumns,
  sort: Sort.DepthFirst,
  linkValue: LinkValue.Items,
  theme: Theme.DarkMode,
  showHeader: true,
};

export const storedSettingsState: SettingsState = loadSettings();

export function settingsReducer(
  state: SettingsState = storedSettingsState,
  action: SettingsAction | AppLoadAction
): SettingsState {
  switch (action.type) {
    case AppActionType.LOAD: {
      const initial = getInitial(state);
      return action.payload.settingsState
        ? { ...initial, ...action.payload.settingsState }
        : initial;
    }
    case SettingsActionType.SAVE_STATE: {
      const states = {
        ...state.states,
        ...{ [action.payload.id]: action.payload.value },
      };
      return { ...state, ...{ states } };
    }
    case SettingsActionType.DELETE_STATE: {
      const states = { ...state.states };
      delete states[action.payload];
      return { ...state, ...{ states } };
    }
    case SettingsActionType.SET_PRESET: {
      return { ...state, ...{ preset: action.payload } };
    }
    case SettingsActionType.SET_BASE: {
      return {
        ...state,
        ...{
          baseId: action.payload,
          modIds: null,
          belt: null,
          fuel: null,
          disabledRecipes: null,
          factoryRank: null,
          moduleRank: null,
          beacon: null,
          beaconModule: null,
        },
      };
    }
    case SettingsActionType.SET_MODS: {
      return {
        ...state,
        ...{
          modIds: StoreUtility.compareValues(action.payload),
        },
      };
    }
    case SettingsActionType.SET_DISABLED_RECIPES: {
      return {
        ...state,
        ...{
          disabledRecipes: StoreUtility.compareValues(action.payload),
        },
      };
    }
    case SettingsActionType.SET_EXPENSIVE: {
      return { ...state, ...{ expensive: action.payload } };
    }
    case SettingsActionType.SET_FACTORY_RANK: {
      return {
        ...state,
        ...{
          factoryRank: StoreUtility.compareRank(action.payload),
        },
      };
    }
    case SettingsActionType.SET_MODULE_RANK: {
      return {
        ...state,
        ...{
          moduleRank: StoreUtility.compareRank(action.payload),
        },
      };
    }
    case SettingsActionType.SET_DRILL_MODULE: {
      return { ...state, ...{ drillModule: action.payload } };
    }
    case SettingsActionType.SET_BEACON: {
      return {
        ...state,
        ...{ beacon: StoreUtility.compareValue(action.payload) },
      };
    }
    case SettingsActionType.SET_BEACON_MODULE: {
      return {
        ...state,
        ...{ beaconModule: StoreUtility.compareValue(action.payload) },
      };
    }
    case SettingsActionType.SET_BEACON_COUNT: {
      return {
        ...state,
        ...{ beaconCount: StoreUtility.compareValue(action.payload) },
      };
    }
    case SettingsActionType.SET_BELT: {
      return {
        ...state,
        ...{ belt: StoreUtility.compareValue(action.payload) },
      };
    }
    case SettingsActionType.SET_FUEL: {
      return {
        ...state,
        ...{ fuel: StoreUtility.compareValue(action.payload) },
      };
    }
    case SettingsActionType.SET_FLOW_RATE: {
      return { ...state, ...{ flowRate: action.payload } };
    }
    case SettingsActionType.SET_DISPLAY_RATE: {
      return { ...state, ...{ displayRate: action.payload } };
    }
    case SettingsActionType.SET_ITEM_PRECISION: {
      return { ...state, ...{ itemPrecision: action.payload } };
    }
    case SettingsActionType.SET_BELT_PRECISION: {
      return { ...state, ...{ beltPrecision: action.payload } };
    }
    case SettingsActionType.SET_WAGON_PRECISION: {
      return { ...state, ...{ wagonPrecision: action.payload } };
    }
    case SettingsActionType.SET_FACTORY_PRECISION: {
      return { ...state, ...{ factoryPrecision: action.payload } };
    }
    case SettingsActionType.SET_POWER_PRECISION: {
      return { ...state, ...{ powerPrecision: action.payload } };
    }
    case SettingsActionType.SET_POLLUTION_PRECISION: {
      return { ...state, ...{ pollutionPrecision: action.payload } };
    }
    case SettingsActionType.SET_MINING_BONUS: {
      return { ...state, ...{ miningBonus: action.payload } };
    }
    case SettingsActionType.SET_RESEARCH_SPEED: {
      return { ...state, ...{ researchSpeed: action.payload } };
    }
    case SettingsActionType.SET_INSERTER_TARGET: {
      return { ...state, ...{ inserterTarget: action.payload } };
    }
    case SettingsActionType.SET_INSERTER_CAPACITY: {
      return { ...state, ...{ inserterCapacity: action.payload } };
    }
    case SettingsActionType.SET_COLUMNS: {
      return { ...state, ...{ columns: action.payload } };
    }
    case SettingsActionType.SET_SORT: {
      return { ...state, ...{ sort: action.payload } };
    }
    case SettingsActionType.SET_LINK_VALUE: {
      return { ...state, ...{ linkValue: action.payload } };
    }
    case SettingsActionType.SET_THEME: {
      return { ...state, ...{ theme: action.payload } };
    }
    case SettingsActionType.SHOW_HEADER: {
      return { ...state, ...{ showHeader: true } };
    }
    case SettingsActionType.HIDE_HEADER: {
      return { ...state, ...{ showHeader: false } };
    }
    case SettingsActionType.RESET: {
      localStorage.clear();
      return {
        ...initialSettingsState,
        ...{ baseId: state.baseId, modIds: state.modIds },
      };
    }
    default:
      return state;
  }
}

export function loadSettings() {
  try {
    const lsSettings = localStorage.getItem(SETTINGS_KEY);
    if (lsSettings) {
      const stored = JSON.parse(lsSettings) as SettingsState;
      if (location.hash) {
        // Only keep user preferences
        return getInitial(stored);
      } else {
        // Load full saved settings
        return { ...initialSettingsState, ...stored };
      }
    }
  } catch (e) {
    console.warn('Settings: Failed to parse local storage');
    console.error(e);

    // Delete local storage to repair
    localStorage.clear();
  }

  // Use initial settings
  return initialSettingsState;
}

/** Keep user preferences and reset all other fields */
export function getInitial(state: SettingsState) {
  return {
    ...initialSettingsState,
    states: state.states,
    columns: state.columns,
    sort: state.sort,
    linkValue: state.linkValue,
    theme: state.theme,
    showHeader: state.showHeader,
  };
}

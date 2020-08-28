import {
  DisplayRate,
  ResearchSpeed,
  Theme,
  LocalStorageKey,
  AllColumns,
} from '~/models';
import { StoreUtility } from '~/utilities';
import { AppLoadAction, AppActionType } from '../app.actions';
import { SettingsAction, SettingsActionType } from './settings.actions';

export interface SettingsState {
  baseId: string;
  modIds: string[];
  belt: string;
  fuel: string;
  disabledRecipes: string[];
  factoryRank: string[];
  moduleRank: string[];
  beaconModule: string;
  displayRate: DisplayRate;
  itemPrecision: number;
  beltPrecision: number;
  factoryPrecision: number;
  beaconCount: number;
  drillModule: boolean;
  miningBonus: number;
  researchSpeed: ResearchSpeed;
  flowRate: number;
  expensive: boolean;
  columns?: string[];
  theme?: Theme;
  showHeader?: boolean;
}

export const initialSettingsState: SettingsState = {
  baseId: '1.0',
  modIds: null,
  belt: null,
  fuel: null,
  disabledRecipes: null,
  factoryRank: null,
  moduleRank: null,
  beaconModule: null,
  displayRate: DisplayRate.PerMinute,
  itemPrecision: 3,
  beltPrecision: 1,
  factoryPrecision: 1,
  beaconCount: 16,
  drillModule: false,
  miningBonus: 0,
  researchSpeed: ResearchSpeed.Speed6,
  flowRate: 1500,
  expensive: false,
  columns: loadColumns(),
  theme: loadTheme(),
  showHeader: loadShowHeader(),
};

export function settingsReducer(
  state: SettingsState = initialSettingsState,
  action: SettingsAction | AppLoadAction
): SettingsState {
  switch (action.type) {
    case AppActionType.LOAD: {
      return action.payload.settingsState
        ? { ...state, ...action.payload.settingsState }
        : state;
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
          beaconModule: null,
        },
      };
    }
    case SettingsActionType.ENABLE_MOD: {
      return {
        ...state,
        ...{
          modIds: StoreUtility.tryAddId(state.modIds, action.payload),
        },
      };
    }
    case SettingsActionType.DISABLE_MOD: {
      return {
        ...state,
        ...{
          modIds: StoreUtility.tryRemoveId(state.modIds, action.payload),
        },
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
    case SettingsActionType.DISABLE_RECIPE: {
      return {
        ...state,
        ...{
          disabledRecipes: StoreUtility.tryAddId(
            state.disabledRecipes,
            action.payload
          ),
        },
      };
    }
    case SettingsActionType.ENABLE_RECIPE: {
      return {
        ...state,
        ...{
          disabledRecipes: StoreUtility.tryRemoveId(
            state.disabledRecipes,
            action.payload
          ),
        },
      };
    }
    case SettingsActionType.PREFER_FACTORY: {
      return {
        ...state,
        ...{
          factoryRank: StoreUtility.tryAddId(state.factoryRank, action.payload),
        },
      };
    }
    case SettingsActionType.DROP_FACTORY: {
      return {
        ...state,
        ...{
          factoryRank: StoreUtility.tryRemoveId(
            state.factoryRank,
            action.payload
          ),
        },
      };
    }
    case SettingsActionType.PREFER_MODULE: {
      return {
        ...state,
        ...{
          moduleRank: StoreUtility.tryAddId(state.moduleRank, action.payload),
        },
      };
    }
    case SettingsActionType.DROP_MODULE: {
      return {
        ...state,
        ...{
          moduleRank: StoreUtility.tryRemoveId(
            state.moduleRank,
            action.payload
          ),
        },
      };
    }
    case SettingsActionType.SET_BEACON_MODULE: {
      return {
        ...state,
        ...{ beaconModule: StoreUtility.compareValue(action.payload) },
      };
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
    case SettingsActionType.SET_FACTORY_PRECISION: {
      return { ...state, ...{ factoryPrecision: action.payload } };
    }
    case SettingsActionType.SET_BEACON_COUNT: {
      return { ...state, ...{ beaconCount: action.payload } };
    }
    case SettingsActionType.SET_DRILL_MODULE: {
      return { ...state, ...{ drillModule: action.payload } };
    }
    case SettingsActionType.SET_MINING_BONUS: {
      return { ...state, ...{ miningBonus: action.payload } };
    }
    case SettingsActionType.SET_RESEARCH_SPEED: {
      return { ...state, ...{ researchSpeed: action.payload } };
    }
    case SettingsActionType.SET_FLOW_RATE: {
      return { ...state, ...{ flowRate: action.payload } };
    }
    case SettingsActionType.SET_EXPENSIVE: {
      return { ...state, ...{ expensive: action.payload } };
    }
    case SettingsActionType.HIDE_COLUMN: {
      const result = state.columns.filter((c) => c !== action.payload);
      localStorage.setItem(LocalStorageKey.Columns, result.join(','));
      return { ...state, ...{ columns: result } };
    }
    case SettingsActionType.SHOW_COLUMN: {
      const result = [...state.columns, action.payload];
      localStorage.setItem(LocalStorageKey.Columns, result.join(','));
      return { ...state, ...{ columns: result } };
    }
    case SettingsActionType.SET_THEME: {
      localStorage.setItem(LocalStorageKey.Theme, action.payload);
      return { ...state, ...{ theme: action.payload } };
    }
    case SettingsActionType.SHOW_HEADER: {
      localStorage.removeItem(LocalStorageKey.ShowHeader);
      return { ...state, ...{ showHeader: true } };
    }
    case SettingsActionType.HIDE_HEADER: {
      localStorage.setItem(LocalStorageKey.ShowHeader, '0');
      return { ...state, ...{ showHeader: false } };
    }
    default:
      return state;
  }
}

export function loadColumns() {
  const lsColumns = localStorage.getItem(LocalStorageKey.Columns);
  return lsColumns ? lsColumns.split(',') : AllColumns;
}

export function loadTheme() {
  const lsTheme = localStorage.getItem(LocalStorageKey.Theme);
  return lsTheme ? (lsTheme as Theme) : Theme.DarkMode;
}

export function loadShowHeader() {
  const lsShowHeader = localStorage.getItem(LocalStorageKey.ShowHeader);
  return lsShowHeader !== '0';
}

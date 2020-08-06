import { DisplayRate, ResearchSpeed, Theme, LocalStorageKey } from '~/models';
import { StoreUtility } from '~/utilities';
import { SettingsAction, SettingsActionType } from './settings.actions';
import { AppLoadAction, AppActionType } from '../app.actions';

export interface SettingsState {
  baseDatasetId: string;
  modDatasetIds: string[];
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
  theme?: Theme;
}

export const initialSettingsState: SettingsState = {
  baseDatasetId: '0.18',
  modDatasetIds: null,
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
  theme: loadTheme(),
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
          baseDatasetId: action.payload,
          modDatasetIds: null,
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
          modDatasetIds: StoreUtility.tryAddId(
            state.modDatasetIds,
            action.payload
          ),
        },
      };
    }
    case SettingsActionType.DISABLE_MOD: {
      return {
        ...state,
        ...{
          modDatasetIds: StoreUtility.tryRemoveId(
            state.modDatasetIds,
            action.payload
          ),
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
    case SettingsActionType.SET_THEME: {
      localStorage.setItem(LocalStorageKey.Theme, action.payload);
      return { ...state, ...{ theme: action.payload } };
    }
    default:
      return state;
  }
}

export function loadTheme() {
  const lsTheme = localStorage.getItem(LocalStorageKey.Theme);
  return lsTheme ? (lsTheme as Theme) : Theme.DarkMode;
}

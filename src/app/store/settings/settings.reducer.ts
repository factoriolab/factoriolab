import {
  DisplayRate,
  ResearchSpeed,
  Theme,
  LocalStorageKey,
  Entities,
} from '~/models';
import { SettingsAction, SettingsActionType } from './settings.actions';
import { AppLoadAction, AppActionType } from '../app.actions';

export interface SettingsState {
  baseDatasetId: string;
  modDatasetIds: string[];
  displayRate: DisplayRate;
  itemPrecision: number;
  beltPrecision: number;
  factoryPrecision: number;
  belt: string;
  fuel: string;
  recipeDisabled: Entities<boolean>;
  factoryRank: string[];
  moduleRank: string[];
  beaconModule: string;
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
  modDatasetIds: [],
  displayRate: DisplayRate.PerMinute,
  itemPrecision: 3,
  beltPrecision: 1,
  factoryPrecision: 1,
  belt: null,
  fuel: null,
  recipeDisabled: {},
  factoryRank: [],
  moduleRank: [],
  beaconModule: null,
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
        },
      };
    }
    case SettingsActionType.SET_DEFAULTS: {
      return {
        ...state,
        ...{
          modDatasetIds: action.payload.modIds,
          belt: action.payload.belt,
          fuel: action.payload.fuel,
          recipeDisabled: action.payload.disabledRecipes.reduce(
            (e: Entities<boolean>, r) => ({ ...e, ...{ [r]: true } }),
            {}
          ),
          factoryRank: action.payload.factoryRank,
          moduleRank: action.payload.moduleRank,
          beaconModule: action.payload.beaconModule,
        },
      };
    }
    case SettingsActionType.ENABLE_MOD: {
      return {
        ...state,
        ...{ modDatasetIds: [...state.modDatasetIds, action.payload] },
      };
    }
    case SettingsActionType.DISABLE_MOD: {
      return {
        ...state,
        ...{
          modDatasetIds: state.modDatasetIds.filter(
            (i) => i !== action.payload
          ),
        },
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
    case SettingsActionType.SET_BELT: {
      return { ...state, ...{ belt: action.payload } };
    }
    case SettingsActionType.SET_FUEL: {
      return { ...state, ...{ fuel: action.payload } };
    }
    case SettingsActionType.DISABLE_RECIPE: {
      return {
        ...state,
        ...{
          recipeDisabled: {
            ...state.recipeDisabled,
            ...{ [action.payload]: true },
          },
        },
      };
    }
    case SettingsActionType.ENABLE_RECIPE: {
      const newDisabled = { ...state.recipeDisabled };
      delete newDisabled[action.payload];
      return { ...state, ...{ recipeDisabled: newDisabled } };
    }
    case SettingsActionType.PREFER_FACTORY: {
      return {
        ...state,
        ...{ factoryRank: [...state.factoryRank, action.payload] },
      };
    }
    case SettingsActionType.DROP_FACTORY: {
      return {
        ...state,
        ...{
          factoryRank: state.factoryRank.filter((r) => r !== action.payload),
        },
      };
    }
    case SettingsActionType.PREFER_MODULE: {
      return {
        ...state,
        ...{ moduleRank: [...state.moduleRank, action.payload] },
      };
    }
    case SettingsActionType.DROP_MODULE: {
      return {
        ...state,
        ...{ moduleRank: state.moduleRank.filter((r) => r !== action.payload) },
      };
    }
    case SettingsActionType.SET_BEACON_MODULE: {
      return { ...state, ...{ beaconModule: action.payload } };
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

import {
  DisplayRate,
  ItemId,
  RecipeId,
  ResearchSpeed,
  Theme,
  LocalStorageKey,
  Entities,
} from '~/models';
import { SettingsAction, SettingsActionType } from './settings.actions';

export interface SettingsState {
  displayRate: DisplayRate;
  itemPrecision: number;
  beltPrecision: number;
  factoryPrecision: number;
  belt: string;
  assembler: string;
  furnace: string;
  recipeDisabled: Entities<boolean>;
  fuel: string;
  prodModule: string;
  speedModule: string;
  beaconModule: string;
  beaconCount: number;
  drillModule: boolean;
  miningBonus: number;
  researchSpeed: ResearchSpeed;
  flowRate: number;
  expensive: boolean;
  theme?: Theme;
}

export const loadTheme = () => {
  const lsTheme = localStorage.getItem(LocalStorageKey.Theme);
  return lsTheme ? (lsTheme as Theme) : Theme.DarkMode;
};

export const initialSettingsState: SettingsState = {
  displayRate: DisplayRate.PerMinute,
  itemPrecision: 3,
  beltPrecision: 1,
  factoryPrecision: 1,
  belt: ItemId.ExpressTransportBelt,
  assembler: ItemId.AssemblingMachine3,
  furnace: ItemId.ElectricFurnace,
  recipeDisabled: {
    [RecipeId.BasicOilProcessing]: true,
    [RecipeId.CoalLiquefaction]: true,
    [RecipeId.SolidFuelFromHeavyOil]: true,
  },
  fuel: ItemId.Coal,
  prodModule: ItemId.ProductivityModule3,
  speedModule: ItemId.SpeedModule3,
  beaconModule: ItemId.SpeedModule3,
  drillModule: false,
  beaconCount: 16,
  miningBonus: 0,
  researchSpeed: ResearchSpeed.Speed6,
  flowRate: 1500,
  expensive: false,
  theme: loadTheme(),
};

export function settingsReducer(
  state: SettingsState = initialSettingsState,
  action: SettingsAction
): SettingsState {
  switch (action.type) {
    case SettingsActionType.LOAD: {
      return { ...state, ...action.payload };
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
    case SettingsActionType.SET_ASSEMBLER: {
      return { ...state, ...{ assembler: action.payload } };
    }
    case SettingsActionType.SET_FURNACE: {
      return { ...state, ...{ furnace: action.payload } };
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
    case SettingsActionType.SET_FUEL: {
      return { ...state, ...{ fuel: action.payload } };
    }
    case SettingsActionType.SET_PROD_MODULE: {
      return { ...state, ...{ prodModule: action.payload } };
    }
    case SettingsActionType.SET_SPEED_MODULE: {
      return { ...state, ...{ speedModule: action.payload } };
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

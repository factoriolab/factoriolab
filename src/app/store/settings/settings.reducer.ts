import { DisplayRate, ItemId, RecipeId, ResearchSpeed } from '~/models';
import { SettingsAction, SettingsActionType } from './settings.actions';

export interface SettingsState {
  displayRate: DisplayRate;
  itemPrecision: number;
  beltPrecision: number;
  factoryPrecision: number;
  belt: ItemId;
  assembler: ItemId;
  furnace: ItemId;
  prodModule: ItemId;
  speedModule: ItemId;
  beaconModule: ItemId;
  beaconCount: number;
  oilRecipe: RecipeId;
  fuel: ItemId;
  miningBonus: number;
  researchSpeed: ResearchSpeed;
  flowRate: number;
}

export const initialSettingsState: SettingsState = {
  displayRate: DisplayRate.PerMinute,
  itemPrecision: 3,
  beltPrecision: 1,
  factoryPrecision: 1,
  belt: ItemId.ExpressTransportBelt,
  assembler: ItemId.AssemblingMachine3,
  furnace: ItemId.ElectricFurnace,
  prodModule: ItemId.ProductivityModule3,
  speedModule: ItemId.SpeedModule3,
  beaconModule: ItemId.SpeedModule3,
  beaconCount: 16,
  oilRecipe: RecipeId.AdvancedOilProcessing,
  fuel: ItemId.Coal,
  miningBonus: 0,
  researchSpeed: ResearchSpeed.Speed6,
  flowRate: 12000,
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
    case SettingsActionType.SET_OIL_RECIPE: {
      return { ...state, ...{ oilRecipe: action.payload } };
    }
    case SettingsActionType.SET_FUEL: {
      return { ...state, ...{ fuel: action.payload } };
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
    default:
      return state;
  }
}

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
  otherModule: ItemId;
  beaconType: ItemId;
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
  otherModule: ItemId.SpeedModule3,
  beaconType: ItemId.SpeedModule3,
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
      return {
        ...state,
        ...{ displayRate: action.payload },
      };
    }
    case SettingsActionType.SET_ITEM_PRECISION: {
      return {
        ...state,
        ...{ itemPrecision: action.payload },
      };
    }
    case SettingsActionType.SET_BELT_PRECISION: {
      return {
        ...state,
        ...{ beltPrecision: action.payload },
      };
    }
    case SettingsActionType.SET_FACTORY_PRECISION: {
      return {
        ...state,
        ...{ factoryPrecision: action.payload },
      };
    }
    case SettingsActionType.SET_BELT: {
      return {
        ...state,
        ...{ belt: action.payload },
      };
    }
    case SettingsActionType.SET_ASSEMBLER: {
      return {
        ...state,
        ...{ assembler: action.payload },
      };
    }
    case SettingsActionType.SET_OIL_RECIPE: {
      return { ...state, ...{ oilRecipe: action.payload } };
    }
    default:
      return state;
  }
}

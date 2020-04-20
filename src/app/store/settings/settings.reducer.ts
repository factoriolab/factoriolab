import { DisplayRate, ItemId, RecipeId } from '~/models';
import { SettingsAction, SettingsActionType } from './settings.actions';

export interface SettingsState {
  displayRate: DisplayRate;
  precision: number;
  belt: ItemId;
  assembler: ItemId;
  furnace: ItemId;
  drill: ItemId;
  prodModule: ItemId;
  otherModule: ItemId;
  beaconType: ItemId;
  beaconCount: number;
  oilRecipe: RecipeId;
  fuel: ItemId;
  miningBonus: number;
  flowRate: number;
}

export const initialSettingsState: SettingsState = {
  displayRate: DisplayRate.PerMinute,
  precision: null,
  belt: ItemId.ExpressTransportBelt,
  assembler: ItemId.AssemblingMachine3,
  furnace: ItemId.ElectricFurnace,
  drill: ItemId.ElectricMiningDrill,
  prodModule: ItemId.Module,
  otherModule: ItemId.Module,
  beaconType: ItemId.Module,
  beaconCount: 0,
  oilRecipe: RecipeId.AdvancedOilProcessing,
  fuel: ItemId.Coal,
  miningBonus: 0,
  flowRate: 12000,
};

export function settingsReducer(
  state: SettingsState = initialSettingsState,
  action: SettingsAction
): SettingsState {
  switch (action.type) {
    case SettingsActionType.SET_DISPLAY_RATE: {
      return {
        ...state,
        ...{ displayRate: action.payload },
      };
    }
    case SettingsActionType.SET_BELT: {
      return {
        ...state,
        ...{ belt: action.payload },
      };
    }
    case SettingsActionType.SET_OIL_RECIPE: {
      return { ...state, ...{ oilRecipe: action.payload } };
    }
    default:
      return state;
  }
}

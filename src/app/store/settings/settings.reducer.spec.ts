import {
  DisplayRate,
  ItemId,
  RecipeId,
  ResearchSpeed,
  LocalStorageKey,
  Theme,
} from '~/models';
import * as Actions from './settings.actions';
import {
  settingsReducer,
  initialSettingsState,
  loadTheme,
} from './settings.reducer';

describe('Settings Reducer', () => {
  describe('loadTheme', () => {
    it('should load theme from local storage', () => {
      localStorage.setItem(LocalStorageKey.Theme, Theme.LightMode);
      const result = loadTheme();
      expect(result).toEqual(Theme.LightMode);
    });

    it('should load DarkMode if not found in local storage', () => {
      localStorage.removeItem(LocalStorageKey.Theme);
      const result = loadTheme();
      expect(result).toEqual(Theme.DarkMode);
    });
  });

  describe('LOAD', () => {
    it('should load settings', () => {
      const result = settingsReducer(
        undefined,
        new Actions.LoadAction({ displayRate: DisplayRate.PerHour } as any)
      );
      expect(result.displayRate).toEqual(DisplayRate.PerHour);
    });
  });

  describe('SET_DISPLAY_RATE', () => {
    it('should set the display rate', () => {
      const value = DisplayRate.PerHour;
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetDisplayRateAction(value)
      );
      expect(result.displayRate).toEqual(value);
    });
  });

  describe('SET_ITEM_PRECISION', () => {
    it('should set the item precision', () => {
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetItemPrecisionAction(null)
      );
      expect(result.itemPrecision).toEqual(null);
    });
  });

  describe('SET_BELT_PRECISION', () => {
    it('should set the belt precision', () => {
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetBeltPrecisionAction(null)
      );
      expect(result.beltPrecision).toEqual(null);
    });
  });

  describe('SET_FACTORY_PRECISION', () => {
    it('should set the factory precision', () => {
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetFactoryPrecisionAction(null)
      );
      expect(result.factoryPrecision).toEqual(null);
    });
  });

  describe('SET_THEME', () => {
    it('should set the theme', () => {
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetTheme(null)
      );
      expect(result.theme).toEqual(null);
    });
  });

  describe('SET_BELT', () => {
    it('should set the default belt', () => {
      const value = ItemId.TransportBelt;
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetBeltAction(value)
      );
      expect(result.belt).toEqual(value);
    });
  });

  describe('SET_ASSEMBLER', () => {
    it('should set the default assembler', () => {
      const value = ItemId.AssemblingMachine1;
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetAssemblerAction(value)
      );
      expect(result.assembler).toEqual(value);
    });
  });

  describe('SET_FURNACE', () => {
    it('should set the default furnace', () => {
      const value = ItemId.StoneFurnace;
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetFurnaceAction(value)
      );
      expect(result.furnace).toEqual(value);
    });
  });

  describe('DISABLE_RECIPE', () => {
    it('should disable a recipe', () => {
      const value = RecipeId.AdvancedOilProcessing;
      const result = settingsReducer(
        initialSettingsState,
        new Actions.DisableRecipe(value)
      );
      expect(result.recipeDisabled[value]).toBeTrue();
    });
  });

  describe('ENABLE_RECIPE', () => {
    it('should enable a recipe', () => {
      const value = RecipeId.BasicOilProcessing;
      const result = settingsReducer(
        initialSettingsState,
        new Actions.EnableRecipe(value)
      );
      expect(result.recipeDisabled[value]).toBeUndefined();
    });
  });

  describe('SET_PROD_MODULE', () => {
    it('should set the default prod module', () => {
      const value = ItemId.ProductivityModule;
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetProdModuleAction(value)
      );
      expect(result.prodModule).toEqual(value);
    });
  });

  describe('SET_SPEED_MODULE', () => {
    it('should set the default speed module', () => {
      const value = ItemId.SpeedModule;
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetSpeedModuleAction(value)
      );
      expect(result.speedModule).toEqual(value);
    });
  });

  describe('SET_BEACON_MODULE', () => {
    it('should set the default beacon module', () => {
      const value = ItemId.SpeedModule;
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetBeaconModuleAction(value)
      );
      expect(result.beaconModule).toEqual(value);
    });
  });

  describe('SET_BEACON_COUNT', () => {
    it('should set the default beacon module count', () => {
      const value = 2;
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetBeaconCountAction(value)
      );
      expect(result.beaconCount).toEqual(value);
    });
  });

  describe('SET_FUEL', () => {
    it('should set the fuel', () => {
      const value = ItemId.Wood;
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetFuelAction(value)
      );
      expect(result.fuel).toEqual(value);
    });
  });

  describe('SET_DRILL_MODULE', () => {
    it('should set the drill module flag', () => {
      const value = true;
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetDrillModuleAction(value)
      );
      expect(result.drillModule).toEqual(value);
    });
  });

  describe('SET_MINING_BONUS', () => {
    it('should set the mining bonus', () => {
      const value = 10;
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetMiningBonusAction(value)
      );
      expect(result.miningBonus).toEqual(value);
    });
  });

  describe('SET_RESEARCH_SPEED', () => {
    it('should set the research speed', () => {
      const value = ResearchSpeed.Speed1;
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetResearchSpeedAction(value)
      );
      expect(result.researchSpeed).toEqual(value);
    });
  });

  describe('SET_FLOW_RATE', () => {
    it('should set the flow rate', () => {
      const value = 6000;
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetFlowRateAction(value)
      );
      expect(result.flowRate).toEqual(value);
    });
  });

  describe('SET_EXPENSIVE', () => {
    it('should set expensive flag', () => {
      const value = true;
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetExpensiveAction(value)
      );
      expect(result.expensive).toEqual(value);
    });
  });

  it('should return default state', () => {
    expect(settingsReducer(undefined, { type: 'Test' } as any)).toBe(
      initialSettingsState
    );
  });
});

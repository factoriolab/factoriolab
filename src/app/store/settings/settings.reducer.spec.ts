import { ItemId, RecipeId, Mocks } from 'src/tests';
import { DisplayRate, ResearchSpeed, LocalStorageKey, Theme } from '~/models';
import * as Actions from './settings.actions';
import {
  settingsReducer,
  initialSettingsState,
  loadTheme,
} from './settings.reducer';

describe('Settings Reducer', () => {
  describe('LOAD', () => {
    it('should load settings', () => {
      const result = settingsReducer(
        undefined,
        new Actions.LoadAction({ displayRate: DisplayRate.PerHour } as any)
      );
      expect(result.displayRate).toEqual(DisplayRate.PerHour);
    });
  });

  describe('SET_BASE', () => {
    it('should set the base dataset id and defaults', () => {
      const mod = Mocks.Base;
      const result = settingsReducer(undefined, new Actions.SetBaseAction(mod));
      expect(result.baseDatasetId).toEqual(mod.id);
      expect(result.belt).toEqual(mod.defaults.belt);
      expect(result.fuel).toEqual(mod.defaults.fuel);
      expect(Object.keys(result.recipeDisabled)).toEqual(
        mod.defaults.disabledRecipes
      );
      expect(result.factoryRank).toEqual(mod.defaults.factoryRank);
      expect(result.moduleRank).toEqual(mod.defaults.moduleRank);
      expect(result.beaconModule).toEqual(mod.defaults.beaconModule);
    });
  });

  describe('ENABLE_MOD', () => {
    it('should enable a mod', () => {
      const result = settingsReducer(
        undefined,
        new Actions.EnableModAction('test')
      );
      expect(result.modDatasetIds).toEqual([
        ...initialSettingsState.modDatasetIds,
        'test',
      ]);
    });
  });

  describe('DISABLE_MOD', () => {
    it('should disable a mod', () => {
      const result = settingsReducer(
        undefined,
        new Actions.DisableModAction(initialSettingsState.modDatasetIds[0])
      );
      expect(result.modDatasetIds).toEqual([]);
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

  describe('DISABLE_RECIPE', () => {
    it('should disable a recipe', () => {
      const value = RecipeId.AdvancedOilProcessing;
      const result = settingsReducer(
        initialSettingsState,
        new Actions.DisableRecipeAction(value)
      );
      expect(result.recipeDisabled[value]).toBeTrue();
    });
  });

  describe('ENABLE_RECIPE', () => {
    it('should enable a recipe', () => {
      const value = RecipeId.BasicOilProcessing;
      const result = settingsReducer(
        initialSettingsState,
        new Actions.EnableRecipeAction(value)
      );
      expect(result.recipeDisabled[value]).toBeUndefined();
    });
  });

  describe('PREFER_FACTORY', () => {
    it('should add a factory to the rank list', () => {
      const value = ItemId.AssemblingMachine1;
      const result = settingsReducer(
        initialSettingsState,
        new Actions.PreferFactoryAction(value)
      );
      expect(result.factoryRank).toEqual([value]);
    });
  });

  describe('DROP_FACTORY', () => {
    it('should remove a factory from the rank list', () => {
      const value = ItemId.AssemblingMachine1;
      const result = settingsReducer(
        { ...initialSettingsState, ...{ factoryRank: [value] } },
        new Actions.DropFactoryAction(value)
      );
      expect(result.factoryRank).toEqual([]);
    });
  });

  describe('PREFER_MODULE', () => {
    it('should add a module to the rank list', () => {
      const value = ItemId.SpeedModule;
      const result = settingsReducer(
        initialSettingsState,
        new Actions.PreferModuleAction(value)
      );
      expect(result.moduleRank).toEqual([value]);
    });
  });

  describe('DROP_MODULE', () => {
    it('should remove a module from the rank list', () => {
      const value = ItemId.SpeedModule;
      const result = settingsReducer(
        { ...initialSettingsState, ...{ moduleRank: [value] } },
        new Actions.DropModuleAction(value)
      );
      expect(result.moduleRank).toEqual([]);
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

  describe('SET_THEME', () => {
    it('should set the theme', () => {
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetTheme(null)
      );
      expect(result.theme).toEqual(null);
    });
  });

  it('should return default state', () => {
    expect(settingsReducer(undefined, { type: 'Test' } as any)).toBe(
      initialSettingsState
    );
  });

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
});

import { ItemId, RecipeId, Mocks } from 'src/tests';
import {
  DisplayRate,
  ResearchSpeed,
  LocalStorageKey,
  Column,
  Preset,
  Theme,
  Sort,
} from '~/models';
import { mockFullSettings } from '~/services/router.service.spec';
import { AppLoadAction } from '../app.actions';
import * as Actions from './settings.actions';
import {
  settingsReducer,
  initialSettingsState,
  loadSettings,
  schema,
} from './settings.reducer';

describe('Settings Reducer', () => {
  describe('LOAD', () => {
    it('should return state if settings state is not included', () => {
      const result = settingsReducer(
        initialSettingsState,
        new AppLoadAction({} as any)
      );
      expect(result).toEqual(initialSettingsState);
    });

    it('should load settings', () => {
      const result = settingsReducer(
        undefined,
        new AppLoadAction({
          settingsState: { displayRate: DisplayRate.PerHour },
        } as any)
      );
      expect(result.displayRate).toEqual(DisplayRate.PerHour);
    });
  });

  describe('SET_PRESET', () => {
    it('should set the preset', () => {
      const value = Preset.Modules;
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetPresetAction(value)
      );
      expect(result.preset).toEqual(value);
    });
  });

  describe('SET_BASE', () => {
    it('should set the base dataset id and defaults', () => {
      const id = Mocks.BaseInfo.id;
      const result = settingsReducer(undefined, new Actions.SetBaseAction(id));
      expect(result.baseId).toEqual(id);
      expect(result.belt).toBeNull();
      expect(result.fuel).toBeNull();
      expect(result.disabledRecipes).toBeNull();
      expect(result.factoryRank).toBeNull();
      expect(result.moduleRank).toBeNull();
      expect(result.beaconModule).toBeNull();
    });
  });

  describe('ENABLE_MOD', () => {
    it('should enable a mod', () => {
      const id = 'test';
      const result = settingsReducer(
        undefined,
        new Actions.EnableModAction({ id, default: [] })
      );
      expect(result.modIds).toEqual([id]);
    });
  });

  describe('DISABLE_MOD', () => {
    it('should disable a mod', () => {
      const id = 'test';
      const result = settingsReducer(
        { modIds: [id] } as any,
        new Actions.DisableModAction({ id, default: [] })
      );
      expect(result.modIds).toBeNull();
    });
  });

  describe('DISABLE_RECIPE', () => {
    it('should disable a recipe', () => {
      const id = RecipeId.AdvancedOilProcessing;
      const result = settingsReducer(
        initialSettingsState,
        new Actions.DisableRecipeAction({ id, default: [] })
      );
      expect(result.disabledRecipes).toEqual([id]);
    });
  });

  describe('ENABLE_RECIPE', () => {
    it('should enable a recipe', () => {
      const id = RecipeId.BasicOilProcessing;
      const result = settingsReducer(
        { disabledRecipes: [id] } as any,
        new Actions.EnableRecipeAction({ id, default: [] })
      );
      expect(result.disabledRecipes).toBeNull();
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

  describe('PREFER_FACTORY', () => {
    it('should add a factory to the rank list', () => {
      const id = ItemId.AssemblingMachine1;
      const result = settingsReducer(
        initialSettingsState,
        new Actions.PreferFactoryAction({ id, default: [] })
      );
      expect(result.factoryRank).toEqual([id]);
    });
  });

  describe('DROP_FACTORY', () => {
    it('should remove a factory from the rank list', () => {
      const id = ItemId.AssemblingMachine1;
      const result = settingsReducer(
        { ...initialSettingsState, ...{ factoryRank: [id] } },
        new Actions.DropFactoryAction({ id, default: [] })
      );
      expect(result.factoryRank).toBeNull();
    });
  });

  describe('PREFER_MODULE', () => {
    it('should add a module to the rank list', () => {
      const id = ItemId.SpeedModule;
      const result = settingsReducer(
        initialSettingsState,
        new Actions.PreferModuleAction({ id, default: [] })
      );
      expect(result.moduleRank).toEqual([id]);
    });
  });

  describe('DROP_MODULE', () => {
    it('should remove a module from the rank list', () => {
      const id = ItemId.SpeedModule;
      const result = settingsReducer(
        { ...initialSettingsState, ...{ moduleRank: [id] } },
        new Actions.DropModuleAction({ id, default: [] })
      );
      expect(result.moduleRank).toBeNull();
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

  describe('SET_BEACON', () => {
    it('should set the default beacon', () => {
      const value = ItemId.Beacon;
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetBeaconAction({ value, default: null })
      );
      expect(result.beacon).toEqual(value);
    });
  });

  describe('SET_BEACON_MODULE', () => {
    it('should set the default beacon module', () => {
      const value = ItemId.SpeedModule;
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetBeaconModuleAction({ value, default: null })
      );
      expect(result.beaconModule).toEqual(value);
    });
  });

  describe('SET_BEACON_COUNT', () => {
    it('should set the default beacon module count', () => {
      const value = 2;
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetBeaconCountAction({ value, default: null })
      );
      expect(result.beaconCount).toEqual(value);
    });
  });

  describe('SET_BELT', () => {
    it('should set the default belt', () => {
      const value = ItemId.TransportBelt;
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetBeltAction({ value, default: null })
      );
      expect(result.belt).toEqual(value);
    });
  });

  describe('SET_FUEL', () => {
    it('should set the fuel', () => {
      const value = ItemId.Wood;
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetFuelAction({ value, default: null })
      );
      expect(result.fuel).toEqual(value);
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

  describe('SET_WAGON_PRECISION', () => {
    it('should set the wagon precision', () => {
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetWagonPrecisionAction(null)
      );
      expect(result.wagonPrecision).toEqual(null);
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

  describe('SET_POWER_PRECISION', () => {
    it('should set the power precision', () => {
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetPowerPrecisionAction(null)
      );
      expect(result.powerPrecision).toEqual(null);
    });
  });

  describe('SET_POLLUTION_PRECISION', () => {
    it('should set the pollution precision', () => {
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetPollutionPrecisionAction(null)
      );
      expect(result.pollutionPrecision).toEqual(null);
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

  describe('HIDE_COLUMN', () => {
    it('should remove a column from the list', () => {
      const value = Column.Beacons;
      const result = settingsReducer(
        { columns: [value] } as any,
        new Actions.HideColumnAction(value)
      );
      expect(result.columns).toEqual([]);
    });
  });

  describe('SHOW_COLUMN', () => {
    it('should add a column to the list', () => {
      const value = Column.Beacons;
      const result = settingsReducer(
        { columns: [] } as any,
        new Actions.ShowColumnAction(value)
      );
      expect(result.columns).toEqual([value]);
    });
  });

  describe('SET_SORT', () => {
    it('should set the sort', () => {
      const value = Sort.BreadthFirst;
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetSortAction(value)
      );
      expect(result.sort).toEqual(value);
    });
  });

  describe('SET_THEME', () => {
    it('should set the theme', () => {
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetThemeAction(null)
      );
      expect(result.theme).toEqual(null);
    });
  });

  describe('RESET', () => {
    it('should reset all except the dataset ids', () => {
      const preserved = { baseId: 'test', modIds: ['test'] };
      const result = settingsReducer(
        { ...mockFullSettings, ...preserved },
        new Actions.ResetAction()
      );
      expect(result).toEqual({ ...initialSettingsState, ...preserved });
    });
  });

  it('should return default state', () => {
    expect(settingsReducer(undefined, { type: 'Test' } as any)).toBe(
      initialSettingsState
    );
  });

  describe('loadSettings', () => {
    afterEach(() => {
      localStorage.clear();
      location.hash = '';
    });

    it('should only preserve columns theme and showHeader if hash is present', () => {
      const preserved = {
        columns: [],
        sort: Sort.BreadthFirst,
        theme: Theme.LightMode,
        showHeader: false,
      };
      const total = { ...mockFullSettings, ...preserved };
      localStorage.setItem(LocalStorageKey.Schema, schema);
      localStorage.setItem(LocalStorageKey.Settings, JSON.stringify(total));
      location.hash = 'test';
      expect(loadSettings()).toEqual({ ...initialSettingsState, ...preserved });
    });

    it('should preserve all settings if no hash is present', () => {
      localStorage.setItem(LocalStorageKey.Schema, schema);
      localStorage.setItem(
        LocalStorageKey.Settings,
        JSON.stringify(mockFullSettings)
      );
      expect(loadSettings()).toEqual({
        ...initialSettingsState,
        ...mockFullSettings,
      });
    });

    it('should handle invalid settings', () => {
      spyOn(console, 'warn');
      spyOn(console, 'error');
      localStorage.setItem(LocalStorageKey.Schema, schema);
      localStorage.setItem(LocalStorageKey.Settings, '[[[');
      expect(loadSettings()).toEqual(initialSettingsState);
      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(localStorage.getItem(LocalStorageKey.Settings)).toBeFalsy();
    });

    it('should use initial settings if no stored settings', () => {
      expect(loadSettings()).toEqual(initialSettingsState);
    });
  });
});

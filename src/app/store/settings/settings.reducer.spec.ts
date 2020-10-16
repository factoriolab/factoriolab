import { ItemId, RecipeId, Mocks } from 'src/tests';
import {
  DisplayRate,
  ResearchSpeed,
  Column,
  Preset,
  Theme,
  Sort,
  LinkValue,
  SETTINGS_KEY,
  InserterTarget,
  InserterCapacity,
} from '~/models';
import { mockFullSettings } from '~/services/router.service.spec';
import { AppLoadAction } from '../app.actions';
import * as Actions from './settings.actions';
import {
  settingsReducer,
  initialSettingsState,
  loadSettings,
  getInitial,
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

  describe('SAVE_STATE', () => {
    it('should add the state to the saved states', () => {
      const id = 'id';
      const value = 'value';
      const result = settingsReducer(
        undefined,
        new Actions.SaveStateAction({ id, value })
      );
      expect(result.states[id]).toEqual(value);
    });
  });

  describe('DELETE_STATE', () => {
    it('should remove the state from the saved states', () => {
      const id = 'id';
      const value = 'value';
      const result = settingsReducer(
        { states: { [id]: value } } as any,
        new Actions.DeleteStateAction(id)
      );
      expect(result.states).toEqual({});
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

  describe('SET_MODS', () => {
    it('should set selected mods', () => {
      const value = ['test'];
      const result = settingsReducer(
        undefined,
        new Actions.SetModsAction({ value, default: [] })
      );
      expect(result.modIds).toEqual(value);
    });
  });

  describe('SET_DISABLED_RECIPES', () => {
    it('should set the list of disabled recipes', () => {
      const value = [RecipeId.AdvancedOilProcessing];
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetDisabledRecipesAction({ value, default: [] })
      );
      expect(result.disabledRecipes).toEqual(value);
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

  describe('SET_FACTORY_RANK', () => {
    it('should set the preferred factory rank', () => {
      const value = [ItemId.AssemblingMachine1];
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetFactoryRankAction({ value, default: [] })
      );
      expect(result.factoryRank).toEqual(value);
    });
  });

  describe('SET_MODULE_RANK', () => {
    it('should set the preferred module rank', () => {
      const value = [ItemId.SpeedModule];
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetModuleRankAction({ value, default: [] })
      );
      expect(result.moduleRank).toEqual(value);
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

  describe('SET_INSERTER_TARGET', () => {
    it('should set the inserter target', () => {
      const value = InserterTarget.Chest;
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetInserterTargetAction(value)
      );
      expect(result.inserterTarget).toEqual(value);
    });
  });

  describe('SET_INSERTER_CAPACITY', () => {
    it('should set the inserter capacity', () => {
      const value = InserterCapacity.Capacity2;
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetInserterCapacityAction(value)
      );
      expect(result.inserterCapacity).toEqual(value);
    });
  });

  describe('SET_COLUMNS', () => {
    it('should set the list of visible columns', () => {
      const value = [Column.Beacons];
      const result = settingsReducer(
        { columns: [value] } as any,
        new Actions.SetColumnsAction(value)
      );
      expect(result.columns).toEqual(value);
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

  describe('SET_LINK_VALUE', () => {
    it('should set the link value', () => {
      const value = LinkValue.Belts;
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetLinkValueAction(value)
      );
      expect(result.linkValue).toEqual(value);
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
    beforeEach(() => {
      localStorage.clear();
      history.replaceState(null, null, '');
    });

    afterEach(() => {
      localStorage.clear();
      history.replaceState(null, null, '');
    });

    it('should only keep user preferences if hash is present', () => {
      const preserved = {
        states: {},
        columns: [],
        sort: Sort.BreadthFirst,
        linkValue: LinkValue.Belts,
        theme: Theme.LightMode,
        showHeader: false,
      };
      const total = { ...mockFullSettings, ...preserved };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(total));
      location.hash = 'test';
      expect(loadSettings()).toEqual({ ...initialSettingsState, ...preserved });
    });

    it('should preserve all settings if no hash is present', () => {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(mockFullSettings));
      expect(loadSettings()).toEqual({
        ...initialSettingsState,
        ...mockFullSettings,
      });
    });

    it('should handle invalid settings', () => {
      spyOn(console, 'warn');
      spyOn(console, 'error');
      localStorage.setItem(SETTINGS_KEY, '[[[');
      expect(loadSettings()).toEqual(initialSettingsState);
      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(localStorage.getItem(SETTINGS_KEY)).toBeFalsy();
    });

    it('should use initial settings if no stored settings', () => {
      expect(loadSettings()).toEqual(initialSettingsState);
    });
  });

  describe('getInitial', () => {
    it('should apply only user preferences to the initial state', () => {
      const result = getInitial({
        preset: Preset.Beacon12,
        states: {},
        columns: [],
        sort: Sort.BreadthFirst,
        linkValue: LinkValue.Belts,
        theme: Theme.LightMode,
        showHeader: false,
      } as any);
      expect(result.preset).toEqual(initialSettingsState.preset);
      expect(result.sort).toEqual(Sort.BreadthFirst);
      expect(result.linkValue).toEqual(LinkValue.Belts);
      expect(result.theme).toEqual(Theme.LightMode);
      expect(result.showHeader).toBeFalse();
    });
  });
});

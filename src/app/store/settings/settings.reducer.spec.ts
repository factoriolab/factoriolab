import { ItemId, RecipeId } from 'src/tests';
import {
  DisplayRate,
  ResearchSpeed,
  Preset,
  InserterTarget,
  InserterCapacity,
} from '~/models';
import { LoadAction } from '../app.actions';
import * as Actions from './settings.actions';
import { settingsReducer, initialSettingsState } from './settings.reducer';

describe('Settings Reducer', () => {
  describe('LOAD', () => {
    it('should return state if settings state is not included', () => {
      const result = settingsReducer(
        initialSettingsState,
        new LoadAction({} as any)
      );
      expect(result).toEqual(initialSettingsState);
    });

    it('should load settings', () => {
      const result = settingsReducer(
        undefined,
        new LoadAction({
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

  describe('SET_DISABLED_RECIPES', () => {
    it('should set the list of disabled recipes', () => {
      const value = [RecipeId.AdvancedOilProcessing];
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetDisabledRecipesAction({ value, def: [] })
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

  describe('SET_BELT', () => {
    it('should set the default belt', () => {
      const value = ItemId.TransportBelt;
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetBeltAction({ value, def: null })
      );
      expect(result.belt).toEqual(value);
    });
  });

  describe('SET_PIPE', () => {
    it('should set the default pipe', () => {
      const value = ItemId.Pipe;
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetPipeAction({ value, def: null })
      );
      expect(result.pipe).toEqual(value);
    });
  });

  describe('SET_FUEL', () => {
    it('should set the fuel', () => {
      const value = ItemId.Wood;
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetFuelAction({ value, def: null })
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

  describe('SET_CARGO_WAGON', () => {
    it('should set the default cargo wagon', () => {
      const value = ItemId.CargoWagon;
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetCargoWagonAction({ value, def: null })
      );
      expect(result.cargoWagon).toEqual(value);
    });
  });

  describe('SET_FlUID_WAGON', () => {
    it('should set the default fluid wagon', () => {
      const value = ItemId.FluidWagon;
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetFluidWagonAction({ value, def: null })
      );
      expect(result.fluidWagon).toEqual(value);
    });
  });

  describe('SET_DISPLAY_RATE', () => {
    it('should set the display rate', () => {
      const value = DisplayRate.PerHour;
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetDisplayRateAction({ value, prev: DisplayRate.PerSecond })
      );
      expect(result.displayRate).toEqual(value);
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

  it('should return default state', () => {
    expect(settingsReducer(undefined, { type: 'Test' } as any)).toBe(
      initialSettingsState
    );
  });
});

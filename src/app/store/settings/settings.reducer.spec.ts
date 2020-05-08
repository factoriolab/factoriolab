import { DisplayRate, ItemId, RecipeId, ResearchSpeed } from '~/models';
import * as actions from './settings.actions';
import { settingsReducer, initialSettingsState } from './settings.reducer';

describe('Settings Reducer', () => {
  describe('LOAD', () => {
    it('should load settings', () => {
      const result = settingsReducer(
        undefined,
        new actions.LoadAction({ displayRate: DisplayRate.PerHour } as any)
      );
      expect(result.displayRate).toEqual(DisplayRate.PerHour);
    });
  });

  describe('SET_DISPLAY_RATE', () => {
    it('should set the display rate', () => {
      const value = DisplayRate.PerHour;
      const result = settingsReducer(
        initialSettingsState,
        new actions.SetDisplayRateAction(value)
      );
      expect(result.displayRate).toEqual(value);
    });
  });

  describe('SET_ITEM_PRECISION', () => {
    it('should set the item precision', () => {
      const result = settingsReducer(
        initialSettingsState,
        new actions.SetItemPrecisionAction(null)
      );
      expect(result.itemPrecision).toEqual(null);
    });
  });

  describe('SET_BELT_PRECISION', () => {
    it('should set the belt precision', () => {
      const result = settingsReducer(
        initialSettingsState,
        new actions.SetBeltPrecisionAction(null)
      );
      expect(result.beltPrecision).toEqual(null);
    });
  });

  describe('SET_FACTORY_PRECISION', () => {
    it('should set the factory precision', () => {
      const result = settingsReducer(
        initialSettingsState,
        new actions.SetFactoryPrecisionAction(null)
      );
      expect(result.factoryPrecision).toEqual(null);
    });
  });

  describe('SET_BELT', () => {
    it('should set the default belt', () => {
      const value = ItemId.TransportBelt;
      const result = settingsReducer(
        initialSettingsState,
        new actions.SetBeltAction(value)
      );
      expect(result.belt).toEqual(value);
    });
  });

  describe('SET_ASSEMBLER', () => {
    it('should set the default assembler', () => {
      const value = ItemId.AssemblingMachine1;
      const result = settingsReducer(
        initialSettingsState,
        new actions.SetAssemblerAction(value)
      );
      expect(result.assembler).toEqual(value);
    });
  });

  describe('SET_FURNACE', () => {
    it('should set the default furnace', () => {
      const value = ItemId.StoneFurnace;
      const result = settingsReducer(
        initialSettingsState,
        new actions.SetFurnaceAction(value)
      );
      expect(result.furnace).toEqual(value);
    });
  });

  describe('SET_PROD_MODULE', () => {
    it('should set the default prod module', () => {
      const value = ItemId.ProductivityModule;
      const result = settingsReducer(
        initialSettingsState,
        new actions.SetProdModuleAction(value)
      );
      expect(result.prodModule).toEqual(value);
    });
  });

  describe('SET_SPEED_MODULE', () => {
    it('should set the default speed module', () => {
      const value = ItemId.SpeedModule;
      const result = settingsReducer(
        initialSettingsState,
        new actions.SetSpeedModuleAction(value)
      );
      expect(result.speedModule).toEqual(value);
    });
  });

  describe('SET_BEACON_MODULE', () => {
    it('should set the default beacon module', () => {
      const value = ItemId.SpeedModule;
      const result = settingsReducer(
        initialSettingsState,
        new actions.SetBeaconModuleAction(value)
      );
      expect(result.beaconModule).toEqual(value);
    });
  });

  describe('SET_BEACON_COUNT', () => {
    it('should set the default beacon module count', () => {
      const value = 2;
      const result = settingsReducer(
        initialSettingsState,
        new actions.SetBeaconCountAction(value)
      );
      expect(result.beaconCount).toEqual(value);
    });
  });

  describe('SET_OIL_RECIPE', () => {
    it('should set the oil recipe', () => {
      const value = RecipeId.BasicOilProcessing;
      const result = settingsReducer(
        initialSettingsState,
        new actions.SetOilRecipeAction(value)
      );
      expect(result.oilRecipe).toEqual(value);
    });
  });

  describe('SET_FUEL', () => {
    it('should set the fuel', () => {
      const value = ItemId.Wood;
      const result = settingsReducer(
        initialSettingsState,
        new actions.SetFuelAction(value)
      );
      expect(result.fuel).toEqual(value);
    });
  });

  describe('SET_MINING_BONUS', () => {
    it('should set the mining bonus', () => {
      const value = 10;
      const result = settingsReducer(
        initialSettingsState,
        new actions.SetMiningBonusAction(value)
      );
      expect(result.miningBonus).toEqual(value);
    });
  });

  describe('SET_RESEARCH_SPEED', () => {
    it('should set the research speed', () => {
      const value = ResearchSpeed.Speed1;
      const result = settingsReducer(
        initialSettingsState,
        new actions.SetResearchSpeedAction(value)
      );
      expect(result.researchSpeed).toEqual(value);
    });
  });

  describe('SET_FLOW_RATE', () => {
    it('should set the flow rate', () => {
      const value = 6000;
      const result = settingsReducer(
        initialSettingsState,
        new actions.SetFlowRateAction(value)
      );
      expect(result.flowRate).toEqual(value);
    });
  });

  it('should return default state', () => {
    expect(settingsReducer(undefined, { type: 'Test' } as any)).toBe(
      initialSettingsState
    );
  });
});

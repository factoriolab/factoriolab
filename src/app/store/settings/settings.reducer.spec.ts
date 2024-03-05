import { ItemId, RecipeId } from 'src/tests';
import {
  CostSettings,
  DisplayRate,
  InserterCapacity,
  InserterTarget,
  MaximizeType,
  Preset,
  ResearchSpeed,
} from '~/models';
import * as App from '../app.actions';
import * as Actions from './settings.actions';
import { initialSettingsState, settingsReducer } from './settings.reducer';

describe('Settings Reducer', () => {
  describe('LOAD', () => {
    it('should return state if settings state is not included', () => {
      const result = settingsReducer(
        initialSettingsState,
        new App.LoadAction({} as any),
      );
      expect(result).toEqual(initialSettingsState);
    });

    it('should load settings', () => {
      const result = settingsReducer(
        undefined,
        new App.LoadAction({
          settingsState: { displayRate: DisplayRate.PerHour },
        } as any),
      );
      expect(result.displayRate).toEqual(DisplayRate.PerHour);
    });
  });

  describe('RESET', () => {
    it('should return the initial state', () => {
      const result = settingsReducer(undefined, new App.ResetAction());
      expect(result).toEqual(initialSettingsState);
    });
  });

  describe('SET_MOD', () => {
    it('should set the mod id', () => {
      const value = 'dsp';
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetModAction(value),
      );
      expect(result.modId).toEqual(value);
    });
  });

  describe('SET_RESEARCHED_TECHNOLOGIES', () => {
    it('should set the researched technology ids', () => {
      const value = [RecipeId.ArtilleryShellRange];
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetResearchedTechnologiesAction(value),
      );
      expect(result.researchedTechnologyIds).toEqual(value);
    });
  });

  describe('SET_NET_PRODUCTION_ONLY', () => {
    it('should set the net production only value', () => {
      const value = true;
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetNetProductionOnlyAction(value),
      );
      expect(result.netProductionOnly).toEqual(value);
    });
  });

  describe('SET_SURPLUS_MACHINES_OUTPUT', () => {
    it('should set the surplus machines output value', () => {
      const value = true;
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetSurplusMachinesOutputAction(value),
      );
      expect(result.surplusMachinesOutput).toEqual(value);
    });
  });

  describe('SET_PRESET', () => {
    it('should set the preset', () => {
      const value = Preset.Modules;
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetPresetAction(value),
      );
      expect(result.preset).toEqual(value);
    });
  });

  describe('SET_BEACON_RECEIVERS', () => {
    it('should set default beacon receivers', () => {
      const value = '1';
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetBeaconReceiversAction(value),
      );
      expect(result.beaconReceivers).toEqual(value);
    });
  });

  describe('SET_PROLIFERATOR_SPRAY', () => {
    it('should set the proliferator spray', () => {
      const value = ItemId.ProductivityModule;
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetProliferatorSprayAction(value),
      );
      expect(result.proliferatorSprayId).toEqual(value);
    });
  });

  describe('SET_BELT', () => {
    it('should set the default belt', () => {
      const value = ItemId.TransportBelt;
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetBeltAction({ value, def: undefined }),
      );
      expect(result.beltId).toEqual(value);
    });
  });

  describe('SET_PIPE', () => {
    it('should set the default pipe', () => {
      const value = ItemId.Pipe;
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetPipeAction({ value, def: undefined }),
      );
      expect(result.pipeId).toEqual(value);
    });
  });

  describe('SET_FUEL_RANK', () => {
    it('should set the fuel', () => {
      const value = [ItemId.Wood];
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetFuelRankAction({ value, def: undefined }),
      );
      expect(result.fuelRankIds).toEqual(value);
    });
  });

  describe('SET_CARGO_WAGON', () => {
    it('should set the default cargo wagon', () => {
      const value = ItemId.CargoWagon;
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetCargoWagonAction({ value, def: undefined }),
      );
      expect(result.cargoWagonId).toEqual(value);
    });
  });

  describe('SET_FlUID_WAGON', () => {
    it('should set the default fluid wagon', () => {
      const value = ItemId.FluidWagon;
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetFluidWagonAction({ value, def: undefined }),
      );
      expect(result.fluidWagonId).toEqual(value);
    });
  });

  describe('SET_FLOW_RATE', () => {
    it('should set the flow rate', () => {
      const value = 6000;
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetFlowRateAction(value),
      );
      expect(result.flowRate).toEqual(value);
    });
  });

  describe('SET_INSERTER_TARGET', () => {
    it('should set the inserter target', () => {
      const value = InserterTarget.Chest;
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetInserterTargetAction(value),
      );
      expect(result.inserterTarget).toEqual(value);
    });
  });

  describe('SET_MINING_BONUS', () => {
    it('should set the mining bonus', () => {
      const value = 10;
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetMiningBonusAction(value),
      );
      expect(result.miningBonus).toEqual(value);
    });
  });

  describe('SET_RESEARCH_SPEED', () => {
    it('should set the research speed', () => {
      const value = ResearchSpeed.Speed1;
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetResearchSpeedAction(value),
      );
      expect(result.researchSpeed).toEqual(value);
    });
  });
  describe('SET_INSERTER_CAPACITY', () => {
    it('should set the inserter capacity', () => {
      const value = InserterCapacity.Capacity2;
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetInserterCapacityAction(value),
      );
      expect(result.inserterCapacity).toEqual(value);
    });
  });

  describe('SET_DISPLAY_RATE', () => {
    it('should set the display rate', () => {
      const value = DisplayRate.PerHour;
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetDisplayRateAction({
          value,
          prev: DisplayRate.PerSecond,
        }),
      );
      expect(result.displayRate).toEqual(value);
    });
  });

  describe('SET_MAXIMIZE_TYPE', () => {
    it('should set the maximize type', () => {
      const value = MaximizeType.Ratio;
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetMaximizeTypeAction(value),
      );
      expect(result.maximizeType).toEqual(MaximizeType.Ratio);
    });
  });

  describe('SET_COSTS', () => {
    it('should set cost values', () => {
      const value: CostSettings = {
        factor: '1',
        machine: '1',
        footprint: '1',
        unproduceable: '1',
        excluded: '1',
        surplus: '1',
        maximize: '-1',
      };
      const result = settingsReducer(
        initialSettingsState,
        new Actions.SetCostsAction(value),
      );
      expect(result.costs).toEqual(value);
    });
  });

  describe('RESET_COST', () => {
    it('should reset the cost fields', () => {
      const result = settingsReducer(
        {
          costs: {
            factor: 'a',
            machine: 'b',
            unproduceable: 'c',
            excluded: 'd',
            surplus: 'e',
            maximize: 'f',
          },
        } as any,
        new Actions.ResetCostAction(),
      );
      expect(result.costs).toEqual(initialSettingsState.costs);
    });
  });

  it('should return default state', () => {
    expect(settingsReducer(undefined, { type: 'Test' } as any)).toBe(
      initialSettingsState,
    );
  });
});

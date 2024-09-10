import {
  CostSettings,
  DisplayRate,
  InserterCapacity,
  InserterTarget,
  MaximizeType,
  Preset,
  rational,
  researchBonusValue,
} from '~/models';
import { ItemId, RecipeId } from '~/tests';

import * as App from '../app.actions';
import * as Actions from './settings.actions';
import { initialState, settingsReducer } from './settings.reducer';

describe('Settings Reducer', () => {
  describe('LOAD', () => {
    it('should return state if settings state is not included', () => {
      const result = settingsReducer(initialState, App.load({ partial: {} }));
      expect(result).toEqual(initialState);
    });

    it('should load settings', () => {
      const result = settingsReducer(
        undefined,
        App.load({
          partial: {
            settingsState: { displayRate: DisplayRate.PerHour },
          },
        }),
      );
      expect(result.displayRate).toEqual(DisplayRate.PerHour);
    });
  });

  describe('RESET', () => {
    it('should return the initial state', () => {
      const result = settingsReducer(undefined, App.reset());
      expect(result).toEqual(initialState);
    });
  });

  describe('SET_MOD', () => {
    it('should set the mod id', () => {
      const modId = 'dsp';
      const result = settingsReducer(initialState, Actions.setMod({ modId }));
      expect(result.modId).toEqual(modId);
    });
  });

  describe('SET_MACHINE_RANK', () => {
    it('should set the machine rank', () => {
      const result = settingsReducer(
        initialState,
        Actions.setMachineRank({
          value: [ItemId.AssemblingMachine1],
          def: undefined,
        }),
      );
      expect(result.machineRankIds).toEqual([ItemId.AssemblingMachine1]);
    });
  });

  describe('SET_FUEL_RANK', () => {
    it('should set the fuel rank', () => {
      const result = settingsReducer(
        initialState,
        Actions.setFuelRank({
          value: [ItemId.Coal],
          def: undefined,
        }),
      );
      expect(result.fuelRankIds).toEqual([ItemId.Coal]);
    });
  });

  describe('SET_MODULE_RANK', () => {
    it('should set the module rank', () => {
      const result = settingsReducer(
        initialState,
        Actions.setModuleRank({
          value: [ItemId.SpeedModule],
          def: undefined,
        }),
      );
      expect(result.moduleRankIds).toEqual([ItemId.SpeedModule]);
    });
  });

  describe('SET_BELT', () => {
    it('should set the default belt', () => {
      const id = ItemId.TransportBelt;
      const result = settingsReducer(
        initialState,
        Actions.setBelt({ id, def: undefined }),
      );
      expect(result.beltId).toEqual(id);
    });
  });

  describe('SET_PIPE', () => {
    it('should set the default pipe', () => {
      const id = ItemId.Pipe;
      const result = settingsReducer(
        initialState,
        Actions.setPipe({ id, def: undefined }),
      );
      expect(result.pipeId).toEqual(id);
    });
  });

  describe('SET_CARGO_WAGON', () => {
    it('should set the default cargo wagon', () => {
      const id = ItemId.CargoWagon;
      const result = settingsReducer(
        initialState,
        Actions.setCargoWagon({ id, def: undefined }),
      );
      expect(result.cargoWagonId).toEqual(id);
    });
  });

  describe('SET_FLUID_WAGON', () => {
    it('should set the default fluid wagon', () => {
      const id = ItemId.FluidWagon;
      const result = settingsReducer(
        initialState,
        Actions.setFluidWagon({ id, def: undefined }),
      );
      expect(result.fluidWagonId).toEqual(id);
    });
  });

  describe('SET_EXCLUDED_RECIPES', () => {
    it('should set the set of excluded recipes', () => {
      const result = settingsReducer(
        initialState,
        Actions.setExcludedRecipes({
          value: new Set([RecipeId.Coal]),
          def: new Set(),
        }),
      );
      expect(result.excludedRecipeIds).toEqual(new Set([RecipeId.Coal]));
    });
  });

  describe('SET_NET_PRODUCTION_ONLY', () => {
    it('should set the net production only value', () => {
      const netProductionOnly = true;
      const result = settingsReducer(
        initialState,
        Actions.setNetProductionOnly({ netProductionOnly }),
      );
      expect(result.netProductionOnly).toEqual(netProductionOnly);
    });
  });

  describe('SET_SURPLUS_MACHINES_OUTPUT', () => {
    it('should set the surplus machines output value', () => {
      const surplusMachinesOutput = true;
      const result = settingsReducer(
        initialState,
        Actions.setSurplusMachinesOutput({ surplusMachinesOutput }),
      );
      expect(result.surplusMachinesOutput).toEqual(surplusMachinesOutput);
    });
  });

  describe('SET_PRESET', () => {
    it('should set the preset', () => {
      const preset = Preset.Modules;
      const result = settingsReducer(
        initialState,
        Actions.setPreset({ preset }),
      );
      expect(result.preset).toEqual(preset);
    });
  });

  describe('SET_BEACON_RECEIVERS', () => {
    it('should set default beacon receivers', () => {
      const beaconReceivers = rational.one;
      const result = settingsReducer(
        initialState,
        Actions.setBeaconReceivers({ beaconReceivers }),
      );
      expect(result.beaconReceivers).toEqual(beaconReceivers);
    });
  });

  describe('SET_PROLIFERATOR_SPRAY', () => {
    it('should set the proliferator spray', () => {
      const proliferatorSprayId = ItemId.ProductivityModule;
      const result = settingsReducer(
        initialState,
        Actions.setProliferatorSpray({ proliferatorSprayId }),
      );
      expect(result.proliferatorSprayId).toEqual(proliferatorSprayId);
    });
  });

  describe('SET_FLOW_RATE', () => {
    it('should set the flow rate', () => {
      const flowRate = rational(6000n);
      const result = settingsReducer(
        initialState,
        Actions.setFlowRate({ flowRate }),
      );
      expect(result.flowRate).toEqual(flowRate);
    });
  });

  describe('SET_INSERTER_TARGET', () => {
    it('should set the inserter target', () => {
      const inserterTarget = InserterTarget.Chest;
      const result = settingsReducer(
        initialState,
        Actions.setInserterTarget({ inserterTarget }),
      );
      expect(result.inserterTarget).toEqual(inserterTarget);
    });
  });

  describe('SET_MINING_BONUS', () => {
    it('should set the mining bonus', () => {
      const miningBonus = rational(10n);
      const result = settingsReducer(
        initialState,
        Actions.setMiningBonus({ miningBonus }),
      );
      expect(result.miningBonus).toEqual(miningBonus);
    });
  });

  describe('SET_RESEARCH_SPEED', () => {
    it('should set the research speed', () => {
      const researchBonus = researchBonusValue.speed1;
      const result = settingsReducer(
        initialState,
        Actions.setResearchBonus({ researchBonus }),
      );
      expect(result.researchBonus).toEqual(researchBonus);
    });
  });

  describe('SET_INSERTER_CAPACITY', () => {
    it('should set the inserter capacity', () => {
      const inserterCapacity = InserterCapacity.Capacity2;
      const result = settingsReducer(
        initialState,
        Actions.setInserterCapacity({ inserterCapacity }),
      );
      expect(result.inserterCapacity).toEqual(inserterCapacity);
    });
  });

  describe('SET_DISPLAY_RATE', () => {
    it('should set the display rate', () => {
      const displayRate = DisplayRate.PerHour;
      const result = settingsReducer(
        initialState,
        Actions.setDisplayRate({
          displayRate,
          previous: DisplayRate.PerSecond,
        }),
      );
      expect(result.displayRate).toEqual(displayRate);
    });
  });

  describe('SET_MAXIMIZE_TYPE', () => {
    it('should set the maximize type', () => {
      const maximizeType = MaximizeType.Ratio;
      const result = settingsReducer(
        initialState,
        Actions.setMaximizeType({ maximizeType }),
      );
      expect(result.maximizeType).toEqual(MaximizeType.Ratio);
    });
  });

  describe('SET_COSTS', () => {
    it('should set cost values', () => {
      const costs: CostSettings = {
        factor: rational.one,
        machine: rational.one,
        footprint: rational.one,
        unproduceable: rational.one,
        excluded: rational.one,
        surplus: rational.one,
        maximize: rational(-1n),
      };
      const result = settingsReducer(initialState, Actions.setCosts({ costs }));
      expect(result.costs).toEqual(costs);
    });
  });

  describe('RESET_EXCLUDED_ITEMS', () => {
    it('should reset the excluded items', () => {
      const result = settingsReducer(
        {
          excludedItemIds: new Set([ItemId.Coal]),
        } as any,
        Actions.resetExcludedItems(),
      );
      expect(result.excludedItemIds).toEqual(initialState.excludedItemIds);
    });
  });

  describe('RESET_CHECKED', () => {
    it('should reset all checked sets', () => {
      const result = settingsReducer(
        {
          checkedItemIds: new Set([ItemId.Coal]),
          checkedRecipeIds: new Set([RecipeId.Coal]),
          checkedObjectiveIds: new Set(['1']),
        } as any,
        Actions.resetChecked(),
      );
      expect(result.checkedItemIds).toEqual(new Set());
      expect(result.checkedRecipeIds).toEqual(new Set());
      expect(result.checkedObjectiveIds).toEqual(new Set());
    });
  });

  describe('RESET_COSTS', () => {
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
        Actions.resetCosts(),
      );
      expect(result.costs).toEqual(initialState.costs);
    });
  });

  it('should return default state', () => {
    expect(settingsReducer(undefined, { type: 'Test' } as any)).toBe(
      initialState,
    );
  });
});

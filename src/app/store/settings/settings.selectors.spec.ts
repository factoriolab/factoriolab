import {
  EnergyType,
  Game,
  gameInfo,
  initialColumnsState,
  InserterCapacity,
  InserterData,
  InserterTarget,
  Language,
  Preset,
  rational,
  SettingsComplete,
} from '~/models';
import { assert, ItemId, Mocks, RecipeId } from '~/tests';

import { initialState } from './settings.reducer';
import * as Selectors from './settings.selectors';

describe('Settings Selectors', () => {
  describe('Base selector functions', () => {
    it('should get slices of state', () => {
      expect(Selectors.selectBeaconReceivers.projector(initialState)).toEqual(
        initialState.beaconReceivers,
      );
      expect(Selectors.selectInserterTarget.projector(initialState)).toEqual(
        initialState.inserterTarget,
      );
      expect(Selectors.selectInserterCapacity.projector(initialState)).toEqual(
        initialState.inserterCapacity,
      );
      expect(Selectors.selectMaximizeType.projector(initialState)).toEqual(
        initialState.maximizeType,
      );
    });
  });

  describe('selectBase', () => {
    it('should get the base dataset', () => {
      const result = Selectors.selectMod.projector('test', {
        test: Mocks.Mod,
      });
      expect(result).toEqual(Mocks.Mod);
    });
  });

  describe('selectHash', () => {
    it('should get the base hash', () => {
      const result = Selectors.selectHash.projector('test', {
        test: Mocks.Hash,
      });
      expect(result).toEqual(Mocks.Hash);
    });
  });

  describe('selectGame', () => {
    it('should get the game', () => {
      const result = Selectors.selectGame.projector(initialState.modId, {
        [initialState.modId]: Mocks.Mod,
      });
      expect(result).toEqual(Game.Factorio);
    });

    it('should handle no mod info found', () => {
      const result = Selectors.selectGame.projector(initialState.modId, {});
      expect(result).toEqual(Game.Factorio);
    });
  });

  describe('selectGameStates', () => {
    it('should get saved states from the current game', () => {
      const result = Selectors.selectGameStates.projector(
        Game.Factorio,
        Mocks.PreferencesState.states,
      );
      expect(result).toEqual(Mocks.PreferencesState.states[Game.Factorio]);
    });
  });

  describe('selectSavedStates', () => {
    it('should map states to dropdown options', () => {
      const result = Selectors.selectSavedStates.projector(
        Mocks.PreferencesState.states[Game.Factorio],
      );
      expect(result).toEqual([{ label: 'name', value: 'name' }]);
    });
  });

  describe('selectObjectiveUnitOptions', () => {
    it('should get appropriate objective unit options for the game', () => {
      expect(
        Selectors.selectObjectiveUnitOptions.projector(
          Game.DysonSphereProgram,
          Mocks.DisplayRateInfo,
        ).length,
      ).toEqual(3);
    });
  });

  describe('selectColumnsState', () => {
    it('should override columns for Factorio', () => {
      const result = Selectors.selectColumnsState.projector(
        gameInfo[Game.Factorio],
        initialColumnsState,
      );
      expect(result.wagons.show).toBeTrue();
      expect(result.beacons.show).toBeTrue();
      expect(result.pollution.show).toBeTrue();
    });

    it('should override columns for Captain of Industry', () => {
      const result = Selectors.selectColumnsState.projector(
        gameInfo[Game.CaptainOfIndustry],
        initialColumnsState,
      );
      expect(result.wagons.show).toBeFalse();
      expect(result.beacons.show).toBeFalse();
      expect(result.power.show).toBeFalse();
      expect(result.pollution.show).toBeFalse();
    });

    it('should override columns for Dyson Sphere Program', () => {
      const result = Selectors.selectColumnsState.projector(
        gameInfo[Game.DysonSphereProgram],
        initialColumnsState,
      );
      expect(result.wagons.show).toBeFalse();
      expect(result.beacons.show).toBeFalse();
      expect(result.pollution.show).toBeFalse();
    });

    it('should override columns for Satisfactory', () => {
      const result = Selectors.selectColumnsState.projector(
        gameInfo[Game.Satisfactory],
        initialColumnsState,
      );
      expect(result.wagons.show).toBeTrue();
      expect(result.beacons.show).toBeFalse();
      expect(result.pollution.show).toBeFalse();
    });
  });

  describe('selectDefaults', () => {
    it('should handle null base data', () => {
      const result = Selectors.selectDefaults.projector(
        Preset.Minimum,
        undefined,
      );
      expect(result).toBeNull();
    });

    it('should use minimum values', () => {
      const result = Selectors.selectDefaults.projector(
        Preset.Minimum,
        Mocks.Mod,
      );
      assert(result != null);
      expect(result.beltId).toEqual(Mocks.Mod.defaults!.minBelt!);
      expect(result.machineRankIds).toEqual(
        Mocks.Mod.defaults!.minMachineRank!,
      );
      expect(result.moduleRankIds).toEqual([]);
      expect(result.beacons).toEqual([
        {
          count: rational.zero,
          id: ItemId.Beacon,
          modules: [{ count: rational(2n), id: ItemId.SpeedModule3 }],
        },
      ]);
    });

    it('should use 8 beacons', () => {
      const result = Selectors.selectDefaults.projector(
        Preset.Beacon8,
        Mocks.Mod,
      );
      assert(result != null);
      expect(result.beacons).toEqual([
        {
          count: rational(8n),
          id: ItemId.Beacon,
          modules: [{ count: rational(2n), id: ItemId.SpeedModule3 }],
        },
      ]);
    });

    it('should use 12 beacons', () => {
      const result = Selectors.selectDefaults.projector(
        Preset.Beacon12,
        Mocks.Mod,
      );
      assert(result != null);
      expect(result.beacons).toEqual([
        {
          count: rational(12n),
          id: ItemId.Beacon,
          modules: [{ count: rational(2n), id: ItemId.SpeedModule3 }],
        },
      ]);
    });

    it('should get the defaults from the current base mod', () => {
      const result = Selectors.selectDefaults.projector(
        Preset.Beacon8,
        Mocks.Mod,
      );
      expect(result).toEqual(Mocks.Defaults);
    });

    it('should handle DSP minimum module rank', () => {
      const result = Selectors.selectDefaults.projector(Preset.Minimum, {
        ...Mocks.Mod,
        ...{ game: Game.DysonSphereProgram },
      });
      assert(result != null);
      expect(result.moduleRankIds).toEqual([]);
    });

    it('should handle DSP maximum module rank', () => {
      const result = Selectors.selectDefaults.projector(Preset.Beacon8, {
        ...Mocks.Mod,
        ...{ game: Game.DysonSphereProgram },
      });
      assert(result != null);
      expect(result.moduleRankIds).toEqual(Mocks.Mod.defaults!.moduleRank!);
    });

    it('should handle Satisfactory module rank', () => {
      const result = Selectors.selectDefaults.projector(Preset.Minimum, {
        ...Mocks.Mod,
        ...{ game: Game.Satisfactory },
      });
      assert(result != null);
      expect(result.moduleRankIds).toEqual(Mocks.Defaults.moduleRankIds);
    });

    it('should handle Final Factory module rank', () => {
      const result = Selectors.selectDefaults.projector(Preset.Minimum, {
        ...Mocks.Mod,
        ...{ game: Game.FinalFactory },
      });
      assert(result != null);
      expect(result.moduleRankIds).toEqual(Mocks.Defaults.moduleRankIds);
    });
  });

  describe('selectAllResearchedTechnologyIds', () => {
    it('should return all ids if empty', () => {
      const result = Selectors.selectAllResearchedTechnologyIds.projector(
        new Set(),
        { technologyEntities: {} } as any,
      );
      expect(result).toEqual(new Set());
    });

    it('should return the setting', () => {
      const result = Selectors.selectAllResearchedTechnologyIds.projector(
        new Set([ItemId.ArtilleryShellRange]),
        Mocks.Dataset,
      );
      expect(result).toEqual(new Set([ItemId.ArtilleryShellRange]));
    });
  });

  describe('selectSettings', () => {
    it('should overwrite defaults when specified', () => {
      const value: any = {
        beltId: 'belt',
        pipeId: 'pipe',
        cargoWagonId: 'cargoWagon',
        fluidWagonId: 'fluidWagon',
        excludedRecipeIds: new Set(['excludedRecipes']),
        machineRankIds: 'machineRank',
        fuelRankIds: 'fuelRank',
        moduleRankIds: 'moduleRank',
      };
      const result = Selectors.selectSettings.projector(
        value,
        Mocks.Defaults,
        new Set(),
      );
      for (const key of Object.keys(value) as (keyof SettingsComplete)[])
        expect(result[key]).toEqual(value[key]);
    });

    it('should fall back if setting and defaults are undefined', () => {
      const result = Selectors.selectSettings.projector(
        {} as any,
        null,
        new Set(),
      );
      expect(result.machineRankIds).toEqual([]);
      expect(result.fuelRankIds).toEqual([]);
      expect(result.moduleRankIds).toEqual([]);
    });
  });

  describe('selectI18n', () => {
    it('should map mods to i18n data', () => {
      const result = Selectors.selectI18n.projector(
        Mocks.Mod,
        { [`${Mocks.Mod.id}-zh`]: Mocks.I18n },
        Language.Chinese,
      );
      expect(result).toEqual(Mocks.I18n);
    });

    it('should handle data not loaded yet', () => {
      const result = Selectors.selectI18n.projector(
        undefined,
        {},
        Language.English,
      );
      expect(result).toBeNull();
    });
  });

  describe('selectDataset', () => {
    it('should return a complete dataset for the base and mods', () => {
      const mod = {
        ...Mocks.Mod,
        ...{
          items: [
            ...Mocks.Mod.items,
            {
              id: 'proliferator',
              name: 'Proliferator',
              category: 'logistics',
              row: 0,
              module: { sprays: 1 },
            },
          ],
        },
      };
      const result = Selectors.selectDataset.projector(
        mod,
        Mocks.I18n,
        undefined,
        Mocks.Defaults,
        Game.Factorio,
      );
      expect(result.categoryIds.length).toBeGreaterThan(0);
      expect(Object.keys(result.categoryEntities).length).toEqual(
        result.categoryIds.length,
      );
      expect(Object.keys(result.categoryItemRows).length).toEqual(
        result.categoryIds.length,
      );
      expect(result.iconIds.length).toBeGreaterThan(0);
      expect(Object.keys(result.iconEntities).length).toEqual(
        result.iconIds.length,
      );
      expect(result.itemIds.length).toBeGreaterThan(0);
      expect(result.beltIds.length).toBeGreaterThan(0);
      expect(Object.keys(result.fuelIds).length).toBeGreaterThan(0);
      expect(result.machineIds.length).toBeGreaterThan(0);
      expect(result.moduleIds.length).toBeGreaterThan(0);
      expect(result.proliferatorModuleIds.length).toEqual(1);
      expect(Object.keys(result.itemEntities).length).toEqual(
        result.itemIds.length,
      );
      expect(result.recipeIds.length).toBeGreaterThan(0);
      expect(Object.keys(result.recipeEntities).length).toEqual(
        result.recipeIds.length,
      );
    });

    it('should sort beacons, belts, wagons, and fuels', () => {
      const mod = {
        ...Mocks.Mod,
        ...{
          items: [
            ...Mocks.Mod.items,
            {
              id: 'id',
              name: 'Item',
              category: 'logistics',
              row: 0,
              beacon: {
                effectivity: 1,
                modules: 1,
                range: 1,
                type: EnergyType.Electric as EnergyType.Electric,
                usage: 1,
              },
              cargoWagon: { size: 1 },
              fluidWagon: { capacity: 1 },
            },
          ],
        },
      };
      const result = Selectors.selectDataset.projector(
        mod,
        null,
        undefined,
        Mocks.Defaults,
        Game.Factorio,
      );
      expect(result.beaconIds).toEqual(['id', 'beacon']);
      expect(result.beltIds).toEqual([
        ItemId.TransportBelt,
        'fast-transport-belt',
        'express-transport-belt',
      ]);
      expect(result.cargoWagonIds).toEqual(['id', ItemId.CargoWagon]);
      expect(result.fluidWagonIds).toEqual(['id', ItemId.FluidWagon]);
      expect(result.fuelIds).toEqual([
        'steam',
        'steam-500',
        ItemId.Wood,
        ItemId.Coal,
        ItemId.SolidFuel,
        'rocket-fuel',
        'nuclear-fuel',
        'uranium-fuel-cell',
      ]);
    });

    it('should not sort belts in DSP', () => {
      const mod = {
        ...Mocks.Mod,
        ...{
          items: [
            ...Mocks.Mod.items,
            {
              id: 'id',
              name: 'Item',
              category: 'logistics',
              row: 0,
              belt: { speed: 1 },
            },
          ],
        },
      };
      const result = Selectors.selectDataset.projector(
        mod,
        null,
        undefined,
        Mocks.Defaults,
        Game.DysonSphereProgram,
      );
      expect(result.beltIds).toEqual([
        ItemId.TransportBelt,
        ItemId.FastTransportBelt,
        ItemId.ExpressTransportBelt,
        'id',
      ]);
    });

    it('should handle pipes when found', () => {
      const items = Mocks.Mod.items.map((i) => {
        if (i.id === ItemId.Pipe) {
          return { ...i, ...{ pipe: { speed: 100 } } };
        } else if (i.id === ItemId.CopperCable) {
          return { ...i, ...{ pipe: { speed: 10 } } };
        } else {
          return { ...i };
        }
      });
      const mod = {
        ...Mocks.Mod,
        ...{
          items,
        },
      };
      const result = Selectors.selectDataset.projector(
        mod,
        null,
        undefined,
        Mocks.Defaults,
        Game.Factorio,
      );
      expect(result.pipeIds).toEqual([ItemId.CopperCable, ItemId.Pipe]);
    });

    it('should calculate missing recipe icons', () => {
      const icons = Mocks.Mod.icons.filter(
        (i) => i.id !== RecipeId.AdvancedOilProcessing,
      );
      const mod = {
        ...Mocks.Mod,
        ...{
          icons,
        },
      };
      const result = Selectors.selectDataset.projector(
        mod,
        null,
        undefined,
        Mocks.Defaults,
        Game.Factorio,
      );
      expect(
        result.recipeEntities[RecipeId.AdvancedOilProcessing].icon,
      ).toEqual(ItemId.HeavyOil);
    });

    it('should handle data not loaded yet', () => {
      const result = Selectors.selectDataset.projector(
        undefined,
        null,
        undefined,
        Mocks.Defaults,
        Game.Factorio,
      );
      expect(result.categoryIds.length).toEqual(0);
    });
  });

  describe('selectBeltSpeed', () => {
    it('should return the map of belt speeds', () => {
      const flowRate = rational(2000n);
      const result = Selectors.selectBeltSpeed.projector(
        Mocks.AdjustedDataset,
        flowRate,
      );
      expect(result[ItemId.TransportBelt]).toEqual(
        Mocks.AdjustedDataset.beltEntities[ItemId.TransportBelt].speed,
      );
      expect(result[ItemId.Pipe]).toEqual(flowRate);
    });

    it('should include pipe speeds', () => {
      const data = {
        ...Mocks.AdjustedDataset,
        ...{
          pipeIds: [ItemId.Pipe],
          beltEntities: {
            ...Mocks.AdjustedDataset.beltEntities,
            ...{
              [ItemId.Pipe]: {
                ...Mocks.AdjustedDataset.beltEntities[ItemId.Pipe],
                ...{
                  speed: rational(10n),
                },
              },
            },
          },
        },
      };
      const result = Selectors.selectBeltSpeed.projector(data, rational.zero);
      expect(result[ItemId.Pipe]).toEqual(rational(10n));
    });
  });

  describe('selectBeltSpeedTxt', () => {
    it('should map belt speeds to appropriate rounded values for tooltips', () => {
      const result = Selectors.selectBeltSpeedTxt.projector(
        { a: rational(1n, 60n), b: rational(1n, 180n) },
        Mocks.DisplayRateInfo,
      );
      expect(result['a']).toEqual('1');
      expect(result['b']).toEqual('0.33');
    });
  });

  describe('selectInserterData', () => {
    it('should get the appropriate set of inserter speed data', () => {
      const result = Selectors.selectInserterData.projector(
        InserterTarget.Chest,
        InserterCapacity.Capacity0,
      );
      expect(result).toEqual(
        InserterData[InserterTarget.Chest][InserterCapacity.Capacity0],
      );
    });
  });

  describe('selectAvailableRecipes', () => {
    it('should filter for only unlocked recipes', () => {
      const result = Selectors.selectAvailableRecipes.projector(
        new Set([RecipeId.Automation]),
        Mocks.AdjustedDataset,
      );
      expect(result.length).toEqual(234);
    });
  });
});

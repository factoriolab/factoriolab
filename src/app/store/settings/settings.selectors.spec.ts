import { EnergyType } from '~/models/enum/energy-type';
import { Game } from '~/models/enum/game';
import { InserterCapacity } from '~/models/enum/inserter-capacity';
import { InserterTarget } from '~/models/enum/inserter-target';
import { Language } from '~/models/enum/language';
import { Preset } from '~/models/enum/preset';
import { gameInfo } from '~/models/game-info';
import { InserterData } from '~/models/inserter-data';
import { rational } from '~/models/rational';
import { initialColumnsState } from '~/models/settings/column-settings';
import { SettingsComplete } from '~/models/settings/settings-complete';
import { assert, ItemId, Mocks, RecipeId } from '~/tests';

import { initialSettingsState } from './settings.reducer';
import {
  selectAllResearchedTechnologyIds,
  selectAvailableRecipes,
  selectBeaconReceivers,
  selectBeltSpeed,
  selectBeltSpeedTxt,
  selectColumnsState,
  selectDataset,
  selectDefaults,
  selectGame,
  selectGameStates,
  selectHash,
  selectI18n,
  selectInserterCapacity,
  selectInserterData,
  selectInserterTarget,
  selectMaximizeType,
  selectMod,
  selectObjectiveUnitOptions,
  selectSavedStates,
  selectSettings,
} from './settings.selectors';

describe('Settings Selectors', () => {
  describe('Base selector functions', () => {
    it('should get slices of state', () => {
      expect(selectBeaconReceivers.projector(initialSettingsState)).toEqual(
        initialSettingsState.beaconReceivers,
      );
      expect(selectInserterTarget.projector(initialSettingsState)).toEqual(
        initialSettingsState.inserterTarget,
      );
      expect(selectInserterCapacity.projector(initialSettingsState)).toEqual(
        initialSettingsState.inserterCapacity,
      );
      expect(selectMaximizeType.projector(initialSettingsState)).toEqual(
        initialSettingsState.maximizeType,
      );
    });
  });

  describe('selectBase', () => {
    it('should get the base dataset', () => {
      const result = selectMod.projector('test', {
        test: Mocks.mod,
      });
      expect(result).toEqual(Mocks.mod);
    });
  });

  describe('selectHash', () => {
    it('should get the base hash', () => {
      const result = selectHash.projector('test', {
        test: Mocks.modHash,
      });
      expect(result).toEqual(Mocks.modHash);
    });
  });

  describe('selectGame', () => {
    it('should get the game', () => {
      const result = selectGame.projector(initialSettingsState.modId, {
        [initialSettingsState.modId]: Mocks.mod,
      });
      expect(result).toEqual(Game.Factorio);
    });

    it('should handle no mod info found', () => {
      const result = selectGame.projector(initialSettingsState.modId, {});
      expect(result).toEqual(Game.Factorio);
    });
  });

  describe('selectGameStates', () => {
    it('should get saved states from the current game', () => {
      const result = selectGameStates.projector(
        Game.Factorio,
        Mocks.preferencesState.states,
      );
      expect(result).toEqual(Mocks.preferencesState.states[Game.Factorio]);
    });
  });

  describe('selectSavedStates', () => {
    it('should map states to dropdown options', () => {
      const result = selectSavedStates.projector(
        Mocks.preferencesState.states[Game.Factorio],
      );
      expect(result).toEqual([{ label: 'name', value: 'name' }]);
    });
  });

  describe('selectObjectiveUnitOptions', () => {
    it('should get appropriate objective unit options for the game', () => {
      expect(
        selectObjectiveUnitOptions.projector(
          Game.DysonSphereProgram,
          Mocks.drInfo,
        ).length,
      ).toEqual(3);
    });
  });

  describe('selectColumnsState', () => {
    it('should override columns for Factorio', () => {
      const result = selectColumnsState.projector(
        gameInfo[Game.Factorio],
        initialColumnsState,
      );
      expect(result.wagons.show).toBeTrue();
      expect(result.beacons.show).toBeTrue();
      expect(result.pollution.show).toBeTrue();
    });

    it('should override columns for Captain of Industry', () => {
      const result = selectColumnsState.projector(
        gameInfo[Game.CaptainOfIndustry],
        initialColumnsState,
      );
      expect(result.wagons.show).toBeFalse();
      expect(result.beacons.show).toBeFalse();
      expect(result.power.show).toBeFalse();
      expect(result.pollution.show).toBeFalse();
    });

    it('should override columns for Dyson Sphere Program', () => {
      const result = selectColumnsState.projector(
        gameInfo[Game.DysonSphereProgram],
        initialColumnsState,
      );
      expect(result.wagons.show).toBeFalse();
      expect(result.beacons.show).toBeFalse();
      expect(result.pollution.show).toBeFalse();
    });

    it('should override columns for Satisfactory', () => {
      const result = selectColumnsState.projector(
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
      const result = selectDefaults.projector(Preset.Minimum, undefined);
      expect(result).toBeNull();
    });

    it('should use minimum values', () => {
      const result = selectDefaults.projector(Preset.Minimum, Mocks.mod);
      assert(result != null);
      expect(result.beltId).toEqual(Mocks.mod.defaults?.minBelt);
      expect(result.machineRankIds).toEqual(
        Mocks.mod.defaults!.minMachineRank!,
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
      const result = selectDefaults.projector(Preset.Beacon8, Mocks.mod);
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
      const result = selectDefaults.projector(Preset.Beacon12, Mocks.mod);
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
      const result = selectDefaults.projector(Preset.Beacon8, Mocks.mod);
      expect(result).toEqual(Mocks.defaults);
    });

    it('should handle DSP minimum module rank', () => {
      const result = selectDefaults.projector(Preset.Minimum, {
        ...Mocks.mod,
        ...{ game: Game.DysonSphereProgram },
      });
      assert(result != null);
      expect(result.moduleRankIds).toEqual([]);
    });

    it('should handle DSP maximum module rank', () => {
      const result = selectDefaults.projector(Preset.Beacon8, {
        ...Mocks.mod,
        ...{ game: Game.DysonSphereProgram },
      });
      assert(result != null);
      expect(result.moduleRankIds).toEqual(Mocks.mod.defaults!.moduleRank!);
    });

    it('should handle Satisfactory module rank', () => {
      const result = selectDefaults.projector(Preset.Minimum, {
        ...Mocks.mod,
        ...{ game: Game.Satisfactory },
      });
      assert(result != null);
      expect(result.moduleRankIds).toEqual(Mocks.defaults.moduleRankIds);
    });

    it('should handle Final Factory module rank', () => {
      const result = selectDefaults.projector(Preset.Minimum, {
        ...Mocks.mod,
        ...{ game: Game.FinalFactory },
      });
      assert(result != null);
      expect(result.moduleRankIds).toEqual(Mocks.defaults.moduleRankIds);
    });
  });

  describe('selectAllResearchedTechnologyIds', () => {
    it('should return all ids if empty', () => {
      const result = selectAllResearchedTechnologyIds.projector(new Set(), {
        technologyEntities: {},
      } as any);
      expect(result).toEqual(new Set());
    });

    it('should return the setting', () => {
      const result = selectAllResearchedTechnologyIds.projector(
        new Set([ItemId.ArtilleryShellRange]),
        Mocks.dataset,
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
      const result = selectSettings.projector(value, Mocks.defaults, new Set());
      for (const key of Object.keys(value) as (keyof SettingsComplete)[])
        expect(result[key]).toEqual(value[key]);
    });

    it('should fall back if setting and defaults are undefined', () => {
      const result = selectSettings.projector({} as any, null, new Set());
      expect(result.machineRankIds).toEqual([]);
      expect(result.fuelRankIds).toEqual([]);
      expect(result.moduleRankIds).toEqual([]);
    });
  });

  describe('selectI18n', () => {
    it('should map mods to i18n data', () => {
      const result = selectI18n.projector(
        Mocks.mod,
        { [`${Mocks.mod.id}-zh`]: Mocks.modI18n },
        Language.Chinese,
      );
      expect(result).toEqual(Mocks.modI18n);
    });

    it('should handle data not loaded yet', () => {
      const result = selectI18n.projector(undefined, {}, Language.English);
      expect(result).toBeNull();
    });
  });

  describe('selectDataset', () => {
    it('should return a complete dataset for the base and mods', () => {
      const mod = {
        ...Mocks.mod,
        ...{
          items: [
            ...Mocks.mod.items,
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
      const result = selectDataset.projector(
        mod,
        Mocks.modI18n,
        undefined,
        Mocks.defaults,
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
        ...Mocks.mod,
        ...{
          items: [
            ...Mocks.mod.items,
            {
              id: 'id',
              name: 'Item',
              category: 'logistics',
              row: 0,
              beacon: {
                effectivity: 1,
                modules: 1,
                range: 1,
                type: EnergyType.Electric as const,
                usage: 1,
              },
              cargoWagon: { size: 1 },
              fluidWagon: { capacity: 1 },
            },
          ],
        },
      };
      const result = selectDataset.projector(
        mod,
        null,
        undefined,
        Mocks.defaults,
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
        ...Mocks.mod,
        ...{
          items: [
            ...Mocks.mod.items,
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
      const result = selectDataset.projector(
        mod,
        null,
        undefined,
        Mocks.defaults,
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
      const items = Mocks.mod.items.map((i) => {
        if (i.id === ItemId.Pipe) {
          return { ...i, ...{ pipe: { speed: 100 } } };
        } else if (i.id === ItemId.CopperCable) {
          return { ...i, ...{ pipe: { speed: 10 } } };
        } else {
          return { ...i };
        }
      });
      const mod = {
        ...Mocks.mod,
        ...{
          items,
        },
      };
      const result = selectDataset.projector(
        mod,
        null,
        undefined,
        Mocks.defaults,
        Game.Factorio,
      );
      expect(result.pipeIds).toEqual([ItemId.CopperCable, ItemId.Pipe]);
    });

    it('should calculate missing recipe icons', () => {
      const icons = Mocks.mod.icons.filter(
        (i) => i.id !== RecipeId.AdvancedOilProcessing,
      );
      const mod = {
        ...Mocks.mod,
        ...{
          icons,
        },
      };
      const result = selectDataset.projector(
        mod,
        null,
        undefined,
        Mocks.defaults,
        Game.Factorio,
      );
      expect(
        result.recipeEntities[RecipeId.AdvancedOilProcessing].icon,
      ).toEqual(ItemId.HeavyOil);
    });

    it('should handle data not loaded yet', () => {
      const result = selectDataset.projector(
        undefined,
        null,
        undefined,
        Mocks.defaults,
        Game.Factorio,
      );
      expect(result.categoryIds.length).toEqual(0);
    });
  });

  describe('selectBeltSpeed', () => {
    it('should return the map of belt speeds', () => {
      const flowRate = rational(2000n);
      const result = selectBeltSpeed.projector(Mocks.adjustedDataset, flowRate);
      expect(result[ItemId.TransportBelt]).toEqual(
        Mocks.adjustedDataset.beltEntities[ItemId.TransportBelt].speed,
      );
      expect(result[ItemId.Pipe]).toEqual(flowRate);
    });

    it('should include pipe speeds', () => {
      const data = {
        ...Mocks.adjustedDataset,
        ...{
          pipeIds: [ItemId.Pipe],
          beltEntities: {
            ...Mocks.adjustedDataset.beltEntities,
            ...{
              [ItemId.Pipe]: {
                ...Mocks.adjustedDataset.beltEntities[ItemId.Pipe],
                ...{
                  speed: rational(10n),
                },
              },
            },
          },
        },
      };
      const result = selectBeltSpeed.projector(data, rational.zero);
      expect(result[ItemId.Pipe]).toEqual(rational(10n));
    });
  });

  describe('selectBeltSpeedTxt', () => {
    it('should map belt speeds to appropriate rounded values for tooltips', () => {
      const result = selectBeltSpeedTxt.projector(
        { a: rational(1n, 60n), b: rational(1n, 180n) },
        Mocks.drInfo,
      );
      expect(result['a']).toEqual('1');
      expect(result['b']).toEqual('0.33');
    });
  });

  describe('selectInserterData', () => {
    it('should get the appropriate set of inserter speed data', () => {
      const result = selectInserterData.projector(
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
      const result = selectAvailableRecipes.projector(
        new Set([RecipeId.Automation]),
        Mocks.adjustedDataset,
      );
      expect(result.length).toEqual(234);
    });
  });
});

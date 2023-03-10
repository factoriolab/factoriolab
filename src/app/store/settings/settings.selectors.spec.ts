import { ItemId, Mocks, RecipeId, TestUtility } from 'src/tests';
import {
  Column,
  FuelType,
  Game,
  InserterCapacity,
  InserterData,
  InserterTarget,
  Language,
  Preset,
  Rational,
  ResearchSpeed,
  SimplexType,
} from '~/models';
import * as Preferences from '../preferences';
import { initialSettingsState } from './settings.reducer';
import * as Selectors from './settings.selectors';

describe('Settings Selectors', () => {
  describe('Base selector functions', () => {
    it('should get slices of state', () => {
      expect(
        Selectors.getBeaconReceivers.projector(initialSettingsState)
      ).toEqual(initialSettingsState.beaconReceivers);
      expect(
        Selectors.getInserterTarget.projector(initialSettingsState)
      ).toEqual(initialSettingsState.inserterTarget);
      expect(
        Selectors.getInserterCapacity.projector(initialSettingsState)
      ).toEqual(initialSettingsState.inserterCapacity);
    });
  });

  describe('getBase', () => {
    it('should get the base dataset', () => {
      const result = Selectors.getMod.projector('test', {
        test: Mocks.Mod,
      });
      expect(result).toEqual(Mocks.Mod);
    });
  });

  describe('getHash', () => {
    it('should get the base hash', () => {
      const result = Selectors.getHash.projector('test', {
        test: Mocks.Hash,
      });
      expect(result).toEqual(Mocks.Hash);
    });
  });

  describe('getGame', () => {
    it('should get the game', () => {
      const result = Selectors.getGame.projector(initialSettingsState.modId, {
        [initialSettingsState.modId]: Mocks.ModInfo,
      });
      expect(result).toEqual(Game.Factorio);
    });

    it('should handle no mod info found', () => {
      const result = Selectors.getGame.projector(
        initialSettingsState.modId,
        {}
      );
      expect(result).toEqual(Game.None);
    });
  });

  describe('getColumnsState', () => {
    it('should override columns for Factorio', () => {
      const result = Selectors.getColumnsCfg.projector(
        Game.Factorio,
        Preferences.initialColumnsState
      );
      expect(result[Column.Wagons].show).toBeTrue();
      expect(result[Column.Beacons].show).toBeTrue();
      expect(result[Column.Pollution].show).toBeTrue();
    });

    it('should override columns for Captain of Industry', () => {
      const result = Selectors.getColumnsCfg.projector(
        Game.CaptainOfIndustry,
        Preferences.initialColumnsState
      );
      expect(result[Column.Wagons].show).toBeFalse();
      expect(result[Column.Beacons].show).toBeFalse();
      expect(result[Column.Power].show).toBeFalse();
      expect(result[Column.Pollution].show).toBeFalse();
    });

    it('should override columns for Dyson Sphere Program', () => {
      const result = Selectors.getColumnsCfg.projector(
        Game.DysonSphereProgram,
        Preferences.initialColumnsState
      );
      expect(result[Column.Wagons].show).toBeFalse();
      expect(result[Column.Beacons].show).toBeFalse();
      expect(result[Column.Pollution].show).toBeFalse();
    });

    it('should override columns for Satisfactory', () => {
      const result = Selectors.getColumnsCfg.projector(
        Game.Satisfactory,
        Preferences.initialColumnsState
      );
      expect(result[Column.Wagons].show).toBeTrue();
      expect(result[Column.Beacons].show).toBeFalse();
      expect(result[Column.Pollution].show).toBeFalse();
    });
  });

  describe('getDefaults', () => {
    it('should handle null base data', () => {
      const result = Selectors.getDefaults.projector(Preset.Minimum, undefined);
      expect(result).toBeNull();
    });

    it('should use minimum values', () => {
      const result = Selectors.getDefaults.projector(Preset.Minimum, Mocks.Mod);
      TestUtility.assert(result != null);
      expect(result.beltId).toEqual(Mocks.Mod.defaults!.minBelt!);
      expect(result.machineRankIds).toEqual(
        Mocks.Mod.defaults!.minMachineRank!
      );
      expect(result.moduleRankIds).toEqual([]);
      expect(result.beaconModuleId).toEqual(ItemId.Module);
      expect(result.beaconCount).toEqual('0');
    });

    it('should use 8 beacons', () => {
      const result = Selectors.getDefaults.projector(Preset.Beacon8, Mocks.Mod);
      TestUtility.assert(result != null);
      expect(result.beaconCount).toEqual('8');
    });

    it('should use 12 beacons', () => {
      const result = Selectors.getDefaults.projector(
        Preset.Beacon12,
        Mocks.Mod
      );
      TestUtility.assert(result != null);
      expect(result.beaconCount).toEqual('12');
    });

    it('should get the defaults from the current base mod', () => {
      const result = Selectors.getDefaults.projector(Preset.Beacon8, Mocks.Mod);
      expect(result).toEqual(Mocks.Defaults);
    });

    it('should handle DSP minimum module rank', () => {
      const result = Selectors.getDefaults.projector(Preset.Minimum, {
        ...Mocks.Mod,
        ...{ game: Game.DysonSphereProgram },
      });
      TestUtility.assert(result != null);
      expect(result.moduleRankIds).toEqual([]);
    });

    it('should handle DSP maximum module rank', () => {
      const result = Selectors.getDefaults.projector(Preset.Beacon8, {
        ...Mocks.Mod,
        ...{ game: Game.DysonSphereProgram },
      });
      TestUtility.assert(result != null);
      expect(result.moduleRankIds).toEqual(Mocks.Mod.defaults!.moduleRank);
    });

    it('should handle Satisfactory module rank', () => {
      const result = Selectors.getDefaults.projector(Preset.Minimum, {
        ...Mocks.Mod,
        ...{ game: Game.Satisfactory },
      });
      TestUtility.assert(result != null);
      expect(result.moduleRankIds).toEqual(Mocks.Defaults.moduleRankIds);
    });
  });

  describe('getSettings', () => {
    it('should overwrite defaults when specified', () => {
      const value: any = {
        modIds: 'modDatasetIds',
        beltId: 'belt',
        pipeId: 'pipe',
        fuelId: 'fuel',
        cargoWagonId: 'cargoWagon',
        fluidWagonId: 'fluidWagon',
        excludedRecipeIds: 'excludedRecipes',
        machineRankIds: 'machineRank',
        moduleRankIds: 'moduleRank',
        beaconCount: 'beaconCount',
        beaconId: 'beacon',
        beaconModuleId: 'beaconModule',
      };
      const result = Selectors.getSettings.projector(value, Mocks.Defaults);
      expect(result).toEqual(value);
    });

    it('should use defaults', () => {
      const result = Selectors.getSettings.projector(
        initialSettingsState,
        Mocks.Defaults
      );
      expect(result).toEqual({
        ...initialSettingsState,
        ...{
          beltId: Mocks.Defaults.beltId,
          pipeId: undefined,
          fuelId: Mocks.Defaults.fuelId,
          cargoWagonId: Mocks.Defaults.cargoWagonId,
          fluidWagonId: Mocks.Defaults.fluidWagonId,
          excludedRecipeIds: Mocks.Defaults.excludedRecipeIds,
        },
      });
    });

    it('should handle null defaults', () => {
      const result = Selectors.getSettings.projector(
        initialSettingsState,
        null
      );
      expect(result).toEqual({
        ...initialSettingsState,
        ...{
          beltId: undefined,
          pipeId: undefined,
          fuelId: undefined,
          cargoWagonId: undefined,
          fluidWagonId: undefined,
          excludedRecipeIds: [],
        },
      });
    });
  });

  describe('getFuelId', () => {
    it('should return fuel from settings', () => {
      const result = Selectors.getFuelId.projector(Mocks.SettingsStateInitial);
      expect(result).toEqual(Mocks.SettingsStateInitial.fuelId);
    });
  });

  describe('getRationalMiningBonus', () => {
    it('should convert the numeric value to a percent Rational', () => {
      const result = Selectors.getRationalMiningBonus.projector(100);
      expect(result).toEqual(Rational.one);
    });
  });

  describe('getResearchFactor', () => {
    it('should look up the Rational from the dictionary', () => {
      const result = Selectors.getResearchFactor.projector(
        ResearchSpeed.Speed0
      );
      expect(result).toEqual(Rational.one);
    });
  });

  describe('getRationalBeaconReceivers', () => {
    it('should convert the string value to a Rational', () => {
      const result = Selectors.getRationalBeaconReceivers.projector('1');
      expect(result).toEqual(Rational.one);
    });

    it('should handle null setting', () => {
      const result = Selectors.getRationalBeaconReceivers.projector(null);
      expect(result).toBeNull();
    });
  });

  describe('getRationalFlowRate', () => {
    it('should convert the numeric value to a Rational', () => {
      const result = Selectors.getRationalFlowRate.projector(1);
      expect(result).toEqual(Rational.one);
    });
  });

  describe('getSimplexModifiers', () => {
    it('should create an object to be used by simplex calcs', () => {
      const result = Selectors.getSimplexModifiers.projector(
        Rational.one,
        Rational.one
      );
      expect(result).toEqual({
        costInput: Rational.one,
        costExcluded: Rational.one,
      });
    });
  });

  describe('getI18n', () => {
    it('should map mods to i18n data', () => {
      const result = Selectors.getI18n.projector(
        Mocks.Mod,
        { [`${Mocks.Mod.id}-zh`]: Mocks.I18n },
        Language.Chinese
      );
      expect(result).toEqual(Mocks.I18n);
    });

    it('should handle data not loaded yet', () => {
      const result = Selectors.getI18n.projector(
        undefined,
        {},
        Language.English
      );
      expect(result).toBeNull();
    });
  });

  describe('getDataset', () => {
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
      const result = Selectors.getDataset.projector(
        mod,
        Mocks.I18n,
        undefined,
        Mocks.Defaults,
        Game.Factorio
      );
      expect(result.categoryIds.length).toBeGreaterThan(0);
      expect(Object.keys(result.categoryEntities).length).toEqual(
        result.categoryIds.length
      );
      expect(Object.keys(result.categoryItemRows).length).toEqual(
        result.categoryIds.length
      );
      expect(result.iconIds.length).toBeGreaterThan(0);
      expect(Object.keys(result.iconEntities).length).toEqual(
        result.iconIds.length
      );
      expect(result.itemIds.length).toBeGreaterThan(0);
      expect(result.beltIds.length).toBeGreaterThan(0);
      expect(Object.keys(result.fuelIds).length).toBeGreaterThan(0);
      expect(result.machineIds.length).toBeGreaterThan(0);
      expect(result.moduleIds.length).toBeGreaterThan(0);
      expect(result.proliferatorModuleIds.length).toEqual(1);
      expect(Object.keys(result.itemEntities).length).toEqual(
        result.itemIds.length
      );
      expect(Object.keys(result.itemRecipeId).length).toBeGreaterThan(0);
      expect(Object.keys(result.itemRecipeId).length).toBeLessThan(
        result.itemIds.length
      );
      expect(result.recipeIds.length).toBeGreaterThan(0);
      expect(Object.keys(result.recipeEntities).length).toEqual(
        result.recipeIds.length
      );
      expect(Object.keys(result.recipeR).length).toEqual(
        result.recipeIds.length
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
              },
              cargoWagon: { size: 1 },
              fluidWagon: { capacity: 1 },
            },
          ],
        },
      };
      const result = Selectors.getDataset.projector(
        mod,
        null,
        undefined,
        Mocks.Defaults,
        Game.Factorio
      );
      expect(result.beaconIds).toEqual(['id', 'beacon']);
      expect(result.beltIds).toEqual([
        ItemId.TransportBelt,
        'fast-transport-belt',
        'express-transport-belt',
      ]);
      expect(result.cargoWagonIds).toEqual(['id', ItemId.CargoWagon]);
      expect(result.fluidWagonIds).toEqual(['id', ItemId.FluidWagon]);
      expect(result.fuelIds[FuelType.Chemical]).toEqual([
        ItemId.Wood,
        ItemId.Coal,
        ItemId.SolidFuel,
        'rocket-fuel',
        'nuclear-fuel',
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
      const result = Selectors.getDataset.projector(
        mod,
        null,
        undefined,
        Mocks.Defaults,
        Game.DysonSphereProgram
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
      const result = Selectors.getDataset.projector(
        mod,
        null,
        undefined,
        Mocks.Defaults,
        Game.Factorio
      );
      expect(result.pipeIds).toEqual([ItemId.CopperCable, ItemId.Pipe]);
    });

    it('should calculate missing recipe icons', () => {
      const icons = Mocks.Mod.icons.filter(
        (i) => i.id !== RecipeId.AdvancedOilProcessing
      );
      const mod = {
        ...Mocks.Mod,
        ...{
          icons,
        },
      };
      const result = Selectors.getDataset.projector(
        mod,
        null,
        undefined,
        Mocks.Defaults,
        Game.Factorio
      );
      expect(
        result.recipeEntities[RecipeId.AdvancedOilProcessing].icon
      ).toEqual(ItemId.HeavyOil);
    });

    it('should handle data not loaded yet', () => {
      const result = Selectors.getDataset.projector(
        undefined,
        null,
        undefined,
        Mocks.Defaults,
        Game.Factorio
      );
      expect(result.categoryIds.length).toEqual(0);
    });
  });

  describe('getOptions', () => {
    it('should handle no chemical fuels', () => {
      const data = Mocks.getDataset();
      data.fuelIds = {};
      const result = Selectors.getOptions.projector(data);
      expect(result.chemicalFuels.length).toEqual(0);
    });
  });

  describe('getBeltSpeed', () => {
    it('should return the map of belt speeds', () => {
      const flowRate = Rational.from(2000);
      const result = Selectors.getBeltSpeed.projector(Mocks.Dataset, flowRate);
      expect(result[ItemId.TransportBelt]).toEqual(
        Mocks.Dataset.beltEntities[ItemId.TransportBelt].speed
      );
      expect(result[ItemId.Pipe]).toEqual(flowRate);
    });

    it('should include pipe speeds', () => {
      const data = {
        ...Mocks.Dataset,
        ...{
          pipeIds: [ItemId.Pipe],
          beltEntities: {
            ...Mocks.Dataset.beltEntities,
            ...{
              [ItemId.Pipe]: {
                ...Mocks.Dataset.beltEntities[ItemId.Pipe],
                ...{
                  speed: Rational.ten,
                },
              },
            },
          },
        },
      };
      const result = Selectors.getBeltSpeed.projector(data, Rational.from(0));
      expect(result[ItemId.Pipe]).toEqual(Rational.ten);
    });
  });

  describe('getSettingsModified', () => {
    it('should determine whether any settings are modified', () => {
      const result = Selectors.getSettingsModified.projector({
        ...initialSettingsState,
        ...{
          costExcluded: '100',
        },
      });
      expect(result.cost).toBeTrue();
    });
  });

  describe('getInserterData', () => {
    it('should get the appropriate set of inserter speed data', () => {
      const result = Selectors.getInserterData.projector(
        InserterTarget.Chest,
        InserterCapacity.Capacity0
      );
      expect(result).toEqual(
        InserterData[InserterTarget.Chest][InserterCapacity.Capacity0]
      );
    });
  });
});

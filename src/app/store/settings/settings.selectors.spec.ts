import { CategoryId, ItemId, Mocks, RecipeId, TestUtility } from 'src/tests';
import {
  Column,
  FuelType,
  Game,
  InserterCapacity,
  InserterData,
  InserterTarget,
  Preset,
  Rational,
  ResearchSpeed,
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
  });

  describe('getColumnsState', () => {
    it('should override Overclock for Factorio', () => {
      const result = Selectors.getColumnsState.projector(
        Game.Factorio,
        Preferences.initialColumnsState
      );
      expect(result[Column.Wagons].show).toBeTrue();
      expect(result[Column.Overclock].show).toBeFalse();
      expect(result[Column.Beacons].show).toBeTrue();
      expect(result[Column.Pollution].show).toBeTrue();
    });

    it('should override Wagons/Beacons/Pollution for Dyson Sphere Program', () => {
      const result = Selectors.getColumnsState.projector(
        Game.DysonSphereProgram,
        Preferences.initialColumnsState
      );
      expect(result[Column.Wagons].show).toBeFalse();
      expect(result[Column.Overclock].show).toBeFalse();
      expect(result[Column.Beacons].show).toBeFalse();
      expect(result[Column.Pollution].show).toBeFalse();
    });

    it('should override Beacons/Pollution for Satisfactory', () => {
      const result = Selectors.getColumnsState.projector(
        Game.Satisfactory,
        Preferences.initialColumnsState
      );
      expect(result[Column.Wagons].show).toBeTrue();
      expect(result[Column.Overclock].show).toBeTrue();
      expect(result[Column.Beacons].show).toBeFalse();
      expect(result[Column.Pollution].show).toBeFalse();
    });
  });

  describe('getDefaults', () => {
    it('should handle null base data', () => {
      const result = Selectors.getDefaults.projector(null, null);
      expect(result).toBeNull();
    });

    it('should use minimum values', () => {
      const result = Selectors.getDefaults.projector(Preset.Minimum, Mocks.Mod);
      TestUtility.assert(result != null);
      expect(result.beltId).toEqual(Mocks.Mod.defaults!.minBelt!);
      expect(result.factoryRankIds).toEqual(
        Mocks.Mod.defaults!.minFactoryRank!
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
        disabledRecipeIds: 'disabledRecipes',
        factoryRankIds: 'factoryRank',
        moduleRankIds: 'moduleRank',
        beaconCount: 'beaconCount',
        beaconId: 'beacon',
        beaconModuleId: 'beaconModule',
      };
      const result = Selectors.getSettings.projector(value, Mocks.Mod.defaults);
      expect(result).toEqual(value);
    });

    it('should use defaults', () => {
      const result = Selectors.getSettings.projector({}, Mocks.Defaults);
      expect(result).toEqual({
        beltId: Mocks.Defaults.beltId,
        pipeId: undefined,
        fuelId: Mocks.Defaults.fuelId,
        cargoWagonId: Mocks.Defaults.cargoWagonId,
        fluidWagonId: Mocks.Defaults.fluidWagonId,
        disabledRecipeIds: Mocks.Defaults.disabledRecipeIds,
      } as any);
    });

    it('should handle null defaults', () => {
      const result = Selectors.getSettings.projector({}, null);
      expect(result).toEqual({
        beltId: undefined,
        pipeId: undefined,
        fuelId: undefined,
        cargoWagonId: undefined,
        fluidWagonId: undefined,
        disabledRecipeIds: [],
      } as any);
    });
  });

  describe('getFuelId', () => {
    it('should return fuel from settings', () => {
      const result = Selectors.getFuelId.projector(initialSettingsState);
      expect(result).toEqual(initialSettingsState.fuelId);
    });
  });

  describe('getDisabledRecipeIds', () => {
    it('should return disabledRecipes from settings', () => {
      const result =
        Selectors.getDisabledRecipeIds.projector(initialSettingsState);
      expect(result).toEqual(initialSettingsState.disabledRecipeIds!);
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
      const result = Selectors.getRationalBeaconReceivers.projector(undefined);
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
        Rational.one,
        true
      );
      expect(result).toEqual({
        costInput: Rational.one,
        costIgnored: Rational.one,
        simplex: true,
      });
    });
  });

  describe('getI18n', () => {
    it('should map mods to i18n data', () => {
      const result = Selectors.getI18n.projector(
        Mocks.Mod,
        { [`${Mocks.Mod.id}-zh`]: Mocks.I18n },
        'zh'
      );
      expect(result).toEqual(Mocks.I18n);
    });

    it('should handle data not loaded yet', () => {
      const result = Selectors.getI18n.projector(null, null, null);
      expect(result).toBeNull();
    });
  });

  describe('getDataset', () => {
    it('should return a complete dataset for the base and mods', () => {
      const result = Selectors.getDataset.projector(
        Mocks.Raw.app,
        Mocks.Mod,
        Mocks.I18n,
        null,
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
      expect(result.factoryIds.length).toBeGreaterThan(0);
      expect(result.moduleIds.length).toBeGreaterThan(0);
      expect(result.beaconModuleIds.length).toBeGreaterThan(0);
      expect(Object.keys(result.itemEntities).length).toEqual(
        result.itemIds.length
      );
      expect(Object.keys(result.itemRecipeId).length).toBeGreaterThan(0);
      expect(Object.keys(result.itemRecipeId).length).toBeLessThan(
        result.itemIds.length
      );
      expect(result.recipeIds.length).toBeGreaterThan(0);
      expect(result.complexRecipeIds.length).toBeGreaterThan(0);
      expect(result.complexRecipeIds.length).toBeLessThan(
        result.recipeIds.length
      );
      expect(Object.keys(result.recipeEntities).length).toEqual(
        result.recipeIds.length
      );
      expect(Object.keys(result.recipeR).length).toEqual(
        result.recipeIds.length
      );
      expect(Object.keys(result.recipeModuleIds).length).toEqual(
        result.recipeIds.length
      );
    });

    it('should handle empty categories', () => {
      const data = {
        ...Mocks.Raw.app,
        ...{ categories: [{ id: 'test', name: 'test' }] },
      };
      const result = Selectors.getDataset.projector(
        data,
        Mocks.Mod,
        null,
        null,
        Mocks.Defaults,
        Game.Factorio
      );
      expect(result.categoryIds.length).toBeGreaterThan(0);
      expect(
        Object.keys(result.categoryEntities).length
      ).toBeGreaterThanOrEqual(result.categoryIds.length);
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
      expect(result.factoryIds.length).toBeGreaterThan(0);
      expect(result.moduleIds.length).toBeGreaterThan(0);
      expect(result.beaconModuleIds.length).toBeGreaterThan(0);
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
      expect(Object.keys(result.recipeModuleIds).length).toEqual(
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
        Mocks.Raw.app,
        mod,
        null,
        null,
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
        Mocks.Raw.app,
        mod,
        null,
        null,
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
        Mocks.Raw.app,
        mod,
        null,
        null,
        Mocks.Defaults,
        Game.Factorio
      );
      expect(result.pipeIds).toEqual([ItemId.CopperCable, ItemId.Pipe]);
    });

    it('should copy icons', () => {
      const categories = Mocks.Mod.categories.map((c) => {
        if (c.id === CategoryId.Research) {
          return { ...c, ...{ icon: ItemId.ArtilleryShellRange } };
        } else {
          return { ...c };
        }
      });
      const items = Mocks.Mod.items.map((i) => {
        if (i.id === ItemId.Pipe) {
          return { ...i, ...{ icon: ItemId.Beacon } };
        } else {
          return { ...i };
        }
      });
      const recipes = Mocks.Mod.recipes.map((r) => {
        if (r.id === RecipeId.Coal) {
          return { ...r, ...{ icon: RecipeId.PlasticBar } };
        } else {
          return { ...r };
        }
      });
      const mod = {
        ...Mocks.Mod,
        ...{
          categories,
          items,
          recipes,
        },
      };
      const result = Selectors.getDataset.projector(
        Mocks.Raw.app,
        mod,
        null,
        null,
        Mocks.Defaults,
        Game.Factorio
      );
      expect(result.iconEntities[CategoryId.Research]).toEqual(
        result.iconEntities[RecipeId.ArtilleryShellRange]
      );
      expect(result.iconEntities[ItemId.Pipe]).toEqual(
        result.iconEntities[ItemId.Beacon]
      );
      expect(result.iconEntities[RecipeId.Coal]).toEqual(
        result.iconEntities[RecipeId.PlasticBar]
      );
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
        Mocks.Raw.app,
        mod,
        null,
        null,
        Mocks.Defaults,
        Game.Factorio
      );
      expect(result.iconEntities[RecipeId.AdvancedOilProcessing]).toEqual(
        result.iconEntities[ItemId.HeavyOil]
      );
    });

    it('should handle specified icon files', () => {
      const result = Selectors.getDataset.projector(
        {
          ...Mocks.Raw.app,
          ...{ icons: [...Mocks.Raw.app.icons, { id: '0', file: 'file0' }] },
        },

        {
          ...Mocks.Mod,
          ...{ icons: [...Mocks.Mod.icons, { id: '1', file: 'file1' }] },
        },

        null,
        null,
        Mocks.Defaults,
        Game.Factorio
      );
      expect(result.iconEntities['0'].file).toEqual('file0');
      expect(result.iconEntities['1'].file).toEqual('file1');
    });

    it('should handle data not loaded yet', () => {
      const result = Selectors.getDataset.projector(
        Mocks.Raw.app,
        null,
        null,
        null,
        Mocks.Defaults,
        Game.Factorio
      );
      expect(result.categoryIds.length).toEqual(0);
    });
  });

  describe('getChemicalFuels', () => {
    it('should handle no matching fuels', () => {
      const result = Selectors.getChemicalFuelIds.projector({ fuelIds: {} });
      expect(result).toEqual([]);
    });
  });

  describe('getBeltSpeed', () => {
    it('should handle null/empty inputs', () => {
      const result = Selectors.getBeltSpeed.projector({}, null);
      expect(Object.keys(result).length).toEqual(1); // Always includes pipe
    });

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
        costIgnored: true,
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

  describe('getEntities', () => {
    it('should combine base and mods list', () => {
      const result = Selectors.getEntities(
        Mocks.App.categories,
        Mocks.Mod.categories
      );
      expect(Object.keys(result).length).toEqual(
        Mocks.App.categories.length + Mocks.Mod.categories.length
      );
    });
  });

  describe('getArrayEntities', () => {
    it('should combine base and mods list arrays', () => {
      const result = Selectors.getArrayEntities(Mocks.Mod.limitations, {
        test: [],
      });
      expect(Object.keys(result).length).toEqual(
        Object.keys(Mocks.Mod.limitations).length + 1
      );
    });
  });
});

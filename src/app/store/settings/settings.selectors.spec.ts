import { Mocks, ItemId, RecipeId } from 'src/tests';
import { Rational, ResearchSpeed, Preset } from '~/models';
import * as Selectors from './settings.selectors';

describe('Settings Selectors', () => {
  describe('getBase', () => {
    it('should get the base dataset', () => {
      const result = Selectors.getBase.projector('test', {
        test: Mocks.Base,
      });
      expect(result).toEqual(Mocks.Base);
    });
  });

  describe('getDefaults', () => {
    it('should handle null base data', () => {
      const result = Selectors.getDefaults.projector(null, null);
      expect(result).toBeNull();
    });

    it('should use minimum values', () => {
      const result = Selectors.getDefaults.projector(
        Preset.Minimum,
        Mocks.Base
      );
      expect(result.belt).toEqual(Mocks.Base.defaults.minBelt);
      expect(result.factoryRank).toEqual(Mocks.Base.defaults.minFactoryRank);
      expect(result.moduleRank).toEqual([]);
      expect(result.beaconModule).toEqual(ItemId.Module);
      expect(result.beaconCount).toEqual(0);
    });

    it('should use 8 beacons', () => {
      const result = Selectors.getDefaults.projector(
        Preset.Beacon8,
        Mocks.Base
      );
      expect(result.beaconCount).toEqual(8);
    });

    it('should use 12 beacons', () => {
      const result = Selectors.getDefaults.projector(
        Preset.Beacon12,
        Mocks.Base
      );
      expect(result.beaconCount).toEqual(12);
    });

    it('should get the defaults from the current base mod', () => {
      const result = Selectors.getDefaults.projector(
        Preset.Beacon8,
        Mocks.Base
      );
      expect(result).toEqual(Mocks.Defaults);
    });
  });

  describe('getSettings', () => {
    it('should overwrite defaults when specified', () => {
      const value: any = {
        modIds: 'modDatasetIds',
        belt: 'belt',
        fuel: 'fuel',
        disabledRecipes: 'disabledRecipes',
        factoryRank: 'factoryRank',
        moduleRank: 'moduleRank',
        beaconCount: 'beaconCount',
        beacon: 'beacon',
        beaconModule: 'beaconModule',
      };
      const result = Selectors.getSettings.projector(
        value,
        Mocks.Base.defaults
      );
      expect(result).toEqual(value);
    });

    it('should use defaults', () => {
      const value = Mocks.InitialSettingsState;
      const result = Selectors.getSettings.projector(value, Mocks.Defaults);
      expect(result).toEqual({ ...value, ...Mocks.Defaults });
    });
  });

  describe('getModIds', () => {
    it('should return modIds from settings', () => {
      const result = Selectors.getModIds.projector(Mocks.InitialSettingsState);
      expect(result).toEqual(Mocks.InitialSettingsState.modIds);
    });
  });

  describe('getBelt', () => {
    it('should return belt from settings', () => {
      const result = Selectors.getBelt.projector(Mocks.InitialSettingsState);
      expect(result).toEqual(Mocks.InitialSettingsState.belt);
    });
  });

  describe('getFuel', () => {
    it('should return fuel from settings', () => {
      const result = Selectors.getFuel.projector(Mocks.InitialSettingsState);
      expect(result).toEqual(Mocks.InitialSettingsState.fuel);
    });
  });

  describe('getDisabledRecipes', () => {
    it('should return disabledRecipes from settings', () => {
      const result = Selectors.getDisabledRecipes.projector(
        Mocks.InitialSettingsState
      );
      expect(result).toEqual(Mocks.InitialSettingsState.disabledRecipes);
    });
  });

  describe('getFactoryRank', () => {
    it('should return factoryRank from settings', () => {
      const result = Selectors.getFactoryRank.projector(
        Mocks.InitialSettingsState
      );
      expect(result).toEqual(Mocks.InitialSettingsState.factoryRank);
    });
  });

  describe('getModuleRank', () => {
    it('should return moduleRank from settings', () => {
      const result = Selectors.getModuleRank.projector(
        Mocks.InitialSettingsState
      );
      expect(result).toEqual(Mocks.InitialSettingsState.moduleRank);
    });
  });

  describe('getBeaconModule', () => {
    it('should return beaconModule from settings', () => {
      const result = Selectors.getBeaconModule.projector(
        Mocks.InitialSettingsState
      );
      expect(result).toEqual(Mocks.InitialSettingsState.beaconModule);
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

  describe('getRationalFlowRate', () => {
    it('should convert the numeric value to a Rational', () => {
      const result = Selectors.getRationalFlowRate.projector(1);
      expect(result).toEqual(Rational.one);
    });
  });

  describe('getAvailableMods', () => {
    it('should map to mod entities', () => {
      const result = Selectors.getAvailableMods.projector(
        Mocks.Base.id,
        Mocks.Raw.mods
      );
      expect(result).toEqual(Mocks.Raw.mods);
    });

    it('should filter out incompatible mods', () => {
      const result = Selectors.getAvailableMods.projector(
        'test',
        Mocks.Raw.mods
      );
      expect(result).toEqual([]);
    });
  });

  describe('getMods', () => {
    it('should map mod ids to entities', () => {
      const result = Selectors.getMods.projector(['research'], {
        research: Mocks.Base,
      });
      expect(result).toEqual([Mocks.Base]);
    });
  });

  describe('getDatasets', () => {
    it('should merge the base and mod sets', () => {
      const result = Selectors.getDatasets.projector(Mocks.Base, [Mocks.Mod1]);
      expect(result).toEqual([Mocks.Base, Mocks.Mod1]);
    });

    it('should return empty if base is not loaded', () => {
      const result = Selectors.getDatasets.projector(null, [Mocks.Mod1]);
      expect(result).toEqual([]);
    });
  });

  describe('getNormalDataset', () => {
    it('should return a complete dataset for the base and mods', () => {
      const result = Selectors.getNormalDataset.projector(
        Mocks.Raw.app,
        [Mocks.Base, Mocks.Mod1],
        Mocks.Defaults
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
      expect(result.fuelIds.length).toBeGreaterThan(0);
      expect(result.factoryIds.length).toBeGreaterThan(0);
      expect(result.moduleIds.length).toBeGreaterThan(0);
      expect(result.beaconModuleIds.length).toBeGreaterThan(0);
      expect(Object.keys(result.itemEntities).length).toEqual(
        result.itemIds.length
      );
      expect(Object.keys(result.itemR).length).toEqual(result.itemIds.length);
      expect(Object.keys(result.itemRecipeIds).length).toBeGreaterThan(0);
      expect(Object.keys(result.itemRecipeIds).length).toBeLessThan(
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
      const result = Selectors.getNormalDataset.projector(
        data,
        [Mocks.Base, Mocks.Mod1],
        Mocks.Defaults
      );
      expect(result.categoryIds.length).toBeGreaterThan(0);
      expect(Object.keys(result.categoryEntities).length).toEqual(
        result.categoryIds.length
      );
      expect(Object.keys(result.categoryItemRows).length).toEqual(
        result.categoryIds.length - 1
      );
      expect(result.iconIds.length).toBeGreaterThan(0);
      expect(Object.keys(result.iconEntities).length).toEqual(
        result.iconIds.length
      );
      expect(result.itemIds.length).toBeGreaterThan(0);
      expect(result.beltIds.length).toBeGreaterThan(0);
      expect(result.fuelIds.length).toBeGreaterThan(0);
      expect(result.factoryIds.length).toBeGreaterThan(0);
      expect(result.moduleIds.length).toBeGreaterThan(0);
      expect(result.beaconModuleIds.length).toBeGreaterThan(0);
      expect(Object.keys(result.itemEntities).length).toEqual(
        result.itemIds.length
      );
      expect(Object.keys(result.itemR).length).toEqual(result.itemIds.length);
      expect(Object.keys(result.itemRecipeIds).length).toBeGreaterThan(0);
      expect(Object.keys(result.itemRecipeIds).length).toBeLessThan(
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

    it('should find item recipe with no inputs', () => {
      const data = {
        ...Mocks.Raw.app,
        ...{
          recipes: [
            {
              id: 'test',
              time: 1,
              out: {
                [ItemId.WoodenChest]: 1,
              },
              producers: [ItemId.AssemblingMachine1],
            },
          ],
        },
      };
      const result = Selectors.getNormalDataset.projector(
        data,
        [Mocks.Base, Mocks.Mod1],
        Mocks.Defaults
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
      expect(result.fuelIds.length).toBeGreaterThan(0);
      expect(result.factoryIds.length).toBeGreaterThan(0);
      expect(result.moduleIds.length).toBeGreaterThan(0);
      expect(result.beaconModuleIds.length).toBeGreaterThan(0);
      expect(Object.keys(result.itemEntities).length).toEqual(
        result.itemIds.length
      );
      expect(Object.keys(result.itemR).length).toEqual(result.itemIds.length);
      expect(Object.keys(result.itemRecipeIds).length).toBeGreaterThan(0);
      expect(Object.keys(result.itemRecipeIds).length).toBeLessThan(
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
      expect(result.itemRecipeIds[ItemId.WoodenChest]).toEqual('test');
    });
  });

  describe('getDataset', () => {
    it('should handle null/empty inputs', () => {
      const result = Selectors.getDataset.projector({}, null);
      expect(result).toEqual({} as any);
    });

    it('should return default dataset if expensive is false', () => {
      const result = Selectors.getDataset.projector(Mocks.Data, false);
      expect(result).toEqual(Mocks.Data);
    });

    it('should return expensive recipes if expensive is true', () => {
      const result = Selectors.getDataset.projector(Mocks.Data, true);
      expect(result.recipeEntities[RecipeId.ElectronicCircuit]).not.toEqual(
        Mocks.Data[RecipeId.ElectronicCircuit]
      );
    });

    it('should delete normal outputs if expensive mode does not declare outputs', () => {
      const data = {
        ...Mocks.Data,
        ...{
          recipeEntities: {
            ...Mocks.Data.recipeEntities,
            ...{
              [RecipeId.CopperCable]: {
                ...Mocks.Data.recipeEntities[RecipeId.CopperCable],
                ...{ expensive: {} },
              },
            },
          },
        },
      };
      const result = Selectors.getDataset.projector(data, true);
      expect(result.recipeEntities[RecipeId.CopperCable].out).toBeUndefined();
    });
  });

  describe('getBeltSpeed', () => {
    it('should handle null/empty inputs', () => {
      const result = Selectors.getBeltSpeed.projector({}, null);
      expect(Object.keys(result).length).toEqual(1); // Always includes pipe
    });

    it('should return the map of belt speeds', () => {
      const beltId = 'transport-belt';
      const flowRate = new Rational(BigInt(2000));
      const result = Selectors.getBeltSpeed.projector(Mocks.Data, flowRate);
      expect(result[beltId]).toEqual(Mocks.Data.itemR[beltId].belt.speed);
      expect(result[ItemId.Pipe]).toEqual(flowRate);
    });
  });

  describe('getEntities', () => {
    it('should combine base and mods list', () => {
      const result = Selectors.getEntities(Mocks.Base.categories, [
        Mocks.Mod1.categories,
      ]);
      expect(Object.keys(result).length).toEqual(
        Mocks.Base.categories.length + Mocks.Mod1.categories.length
      );
    });
  });

  describe('getArrayEntities', () => {
    it('should combine base and mods list arrays', () => {
      const result = Selectors.getArrayEntities(Mocks.Base.limitations, [
        { test: [] },
      ]);
      expect(Object.keys(result).length).toEqual(
        Object.keys(Mocks.Base.limitations).length + 1
      );
    });
  });
});

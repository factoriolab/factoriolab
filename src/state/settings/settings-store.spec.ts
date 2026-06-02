import { TestBed } from '@angular/core/testing';

import { CUSTOM_MOD, Game } from '~/data/game';
import { gameInfo } from '~/data/game-info';
import { EnergyType } from '~/data/schema/energy-type';
import { rational } from '~/rational/rational';
import { ItemId } from '~/tests/item-id';
import {
  mockDefaults11,
  mockModData,
  mockModData11,
  mockModHash,
  mockModI18n,
  mockModId,
  mockModInfo,
} from '~/tests/mocks/data';
import { Mocks } from '~/tests/mocks/mocks';
import { mockPreferencesState } from '~/tests/mocks/preferences';
import { TestModule } from '~/tests/test-module';
import { assert } from '~/tests/utils';

import { DisplayRate, displayRateInfo } from './display-rate';
import { Preset } from './preset';
import { Settings } from './settings';
import { SettingsStore } from './settings-store';

describe('SettingsStore', () => {
  let service: SettingsStore;
  let mocks: Mocks;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestModule] });
    service = TestBed.inject(SettingsStore);
    mocks = TestBed.inject(Mocks);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  describe('customIconsUrl', () => {
    it('should return an object url', () => {
      spyOn(service.customIcons, 'value').and.returnValue({} as any);
      spyOn(URL, 'createObjectURL').and.returnValue('url');
      expect(service.customIconsUrl()).toEqual('url');
    });

    it('should return empty string when invalid', () => {
      spyOn(service.customIcons, 'value').and.returnValue({} as any);
      spyOn(URL, 'createObjectURL').and.throwError('');
      expect(service.customIconsUrl()).toEqual('');
    });

    it('should return empty string when not configured', () => {
      expect(service.customIconsUrl()).toEqual('');
    });
  });

  describe('modDataResource', () => {
    it('should return undefined if custom', () => {
      service.apply({ modId: CUSTOM_MOD });
      TestBed.tick();
      expect(service['modDataResource'].value()).toBeUndefined();
    });
  });

  describe('modHashResource', () => {
    it('should return undefined if custom', () => {
      service.apply({ modId: CUSTOM_MOD });
      TestBed.tick();
      expect(service['modHashResource'].value()).toBeUndefined();
    });
  });

  describe('modData', () => {
    it('should handle nullish values', () => {
      spyOn(service, 'modId').and.returnValue(undefined);
      expect(service.modData()).toBeUndefined();
    });

    it('should get the base dataset', () => {
      expect(service.modData()).toEqual(mockModData);
    });

    it('should handle error in resource', () => {
      spyOn(service['modDataResource'], 'error').and.returnValue(new Error());
      service.apply({ modId: '1.1' });
      TestBed.tick();
      expect(service.modData()).toBeUndefined();
    });
  });

  describe('modHash', () => {
    it('should handle nullish values', () => {
      spyOn(service, 'modId').and.returnValue(undefined);
      expect(service.modHash()).toBeUndefined();
    });

    it('should get the base hash', () => {
      expect(service.modHash()).toEqual(mockModHash);
    });

    it('should get the custom mod hash', () => {
      spyOn(service.customHash, 'value').and.returnValue({} as any);
      service.apply({ modId: CUSTOM_MOD });
      TestBed.tick();
      expect(service.modHash()).toEqual({} as any);
    });

    it('should get handle missing custom mod hash', () => {
      service.apply({ modId: CUSTOM_MOD });
      TestBed.tick();
      expect(service.modHash()).toBeUndefined();
    });

    it('should handle error in resource', () => {
      spyOn(service['modHashResource'], 'error').and.returnValue(new Error());
      service.apply({ modId: '1.1' });
      TestBed.tick();
      expect(service.modHash()).toBeUndefined();
    });
  });

  describe('modI18n', () => {
    it('should handle nullish values', () => {
      spyOn(service, 'modId').and.returnValue(undefined);
      expect(service.modI18n()).toBeUndefined();
    });

    it('should get the i18n data', () => {
      spyOn(service['preferencesStore'], 'language').and.returnValue('zh');
      expect(service.modI18n()).toBeUndefined();
      service['modI18nResource'].set(mockModI18n);
      expect(service.modI18n()).toEqual(mockModI18n);
    });

    it('should handle error in resource', () => {
      spyOn(service['modI18nResource'], 'error').and.returnValue(new Error());
      service.apply({ modId: '1.1' });
      TestBed.tick();
      expect(service.modI18n()).toBeUndefined();
    });
  });

  describe('game', () => {
    it('should return the game or Factorio', () => {
      expect(service.game()).toEqual('factorio');
    });
  });

  describe('modStates', () => {
    it('should return the game states', () => {
      spyOn(service['preferencesStore'], 'states').and.returnValue(
        mockPreferencesState.states,
      );
      expect(service.modStates()).toEqual(
        mockPreferencesState.states[mockModId],
      );
    });
  });

  describe('stateOptions', () => {
    it('should return empty if mod is not yet set', () => {
      spyOn(service, 'modId').and.returnValue(undefined);
      expect(service.modStates()).toEqual({});
    });

    it('should return the options as a list', () => {
      spyOn(service['preferencesStore'], 'states').and.returnValue(
        mockPreferencesState.states,
      );
      expect(service.stateOptions()).toEqual([
        { label: 'name', value: 'name' },
      ]);
    });
  });

  describe('gameInfo', () => {
    it('should return the game info', () => {
      expect(service.gameInfo()).toEqual(gameInfo.factorio);
    });
  });

  describe('displayRateInfo', () => {
    it('should return the display rate info', () => {
      expect(service.displayRateInfo()).toEqual(
        displayRateInfo[DisplayRate.PerMinute],
      );
    });
  });

  describe('modOptions', () => {
    it('should get mod options for a game', () => {
      expect(service.modOptions().length).toBeGreaterThan(0);
    });
  });

  describe('defaults', () => {
    it('should handle null base data', () => {
      spyOn(service, 'modInfo').and.returnValue(undefined);
      expect(service.defaults()).toBeUndefined();
    });

    it('should use minimum values', () => {
      service['modDataResource'].set(mockModData11);
      service.apply({ preset: Preset.Minimum });
      TestBed.tick();
      const result = service.defaults();
      assert(result != null);
      expect(result.beltId).toEqual(mockDefaults11.minBelt);
      expect(result.machineRankIds).toEqual(mockDefaults11.minMachineRank!);
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
      service['modDataResource'].set(mockModData11);
      service.apply({ preset: Preset.Beacon8 });
      TestBed.tick();
      const result = service.defaults();
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
      service['modDataResource'].set(mockModData11);
      service.apply({ preset: Preset.Beacon12 });
      TestBed.tick();
      const result = service.defaults();
      assert(result != null);
      expect(result.beacons).toEqual([
        {
          count: rational(12n),
          id: ItemId.Beacon,
          modules: [{ count: rational(2n), id: ItemId.SpeedModule3 }],
        },
      ]);
    });

    it('should handle DSP minimum module rank', () => {
      const modInfo = { ...mockModInfo, game: 'dyson-sphere-program' as Game };
      spyOn(service, 'modInfo').and.returnValue(modInfo);
      service['modDataResource'].set(mockModData11);
      service.apply({ preset: Preset.Minimum });
      TestBed.tick();
      const result = service.defaults();
      assert(result != null);
      expect(result.moduleRankIds).toEqual([]);
    });

    it('should handle DSP maximum module rank', () => {
      const modInfo = { ...mockModInfo, game: 'dyson-sphere-program' as Game };
      spyOn(service, 'modInfo').and.returnValue(modInfo);
      service['modDataResource'].set(mockModData11);
      service.apply({ preset: Preset.Beacon8 });
      TestBed.tick();
      const result = service.defaults();
      assert(result != null);
      expect(result.moduleRankIds).toEqual(mockDefaults11.moduleRank!);
    });

    it('should handle Satisfactory module rank', () => {
      const modInfo = { ...mockModInfo, game: 'satisfactory' as Game };
      spyOn(service, 'modInfo').and.returnValue(modInfo);
      service['modDataResource'].set(mockModData11);
      service.apply({ preset: Preset.Beacon8 });
      const result = service.defaults();
      assert(result != null);
      expect(result.moduleRankIds).toEqual(mockDefaults11.moduleRank!);
      expect(result.overclock).toEqual(rational(100n));
    });

    it('should handle Final Factory module rank', () => {
      const modInfo = { ...mockModInfo, game: 'final-factory' as Game };
      spyOn(service, 'modInfo').and.returnValue(modInfo);
      service['modDataResource'].set(mockModData11);
      service.apply({ preset: Preset.Beacon8 });
      const result = service.defaults();
      assert(result != null);
      expect(result.moduleRankIds).toEqual(mockDefaults11.moduleRank!);
    });

    it('should handle custom presets', () => {
      const result = service.defaults();
      assert(result != null);
      expect(result.fuelRankIds).toEqual([ItemId.Coal]);
    });
  });

  describe('linkValueOptions', () => {
    it('should return the list of link value options', () => {
      expect(service.linkValueOptions().length).toEqual(6);
    });
  });

  describe('objectiveUnitOptions', () => {
    it('should return the list of options', () => {
      expect(service.objectiveUnitOptions().length).toEqual(4);
    });
  });

  describe('presetOptions', () => {
    it('should return the list of preset options', () => {
      expect(service.presetOptions().length).toEqual(5);
    });
  });

  describe('columnOptions', () => {
    it('should return column options', () => {
      expect(service.columnOptions().length).toEqual(10);
    });
  });

  describe('columnsState', () => {
    it('should return the columns state', () => {
      const result = service.columnsState();
      expect(result.wagons.show).toBeTrue();
      expect(result.beacons.show).toBeTrue();
      expect(result.pollution.show).toBeTrue();
    });
  });

  describe('dataset', () => {
    it('should return a complete dataset for the base and mods', () => {
      const modData = {
        ...mockModData,
        items: [
          ...mockModData.items,
          {
            id: 'proliferator',
            icon: ItemId.Coal,
            name: 'Proliferator',
            category: 'logistics',
            row: 0,
            module: { sprays: 1 },
          },
        ],
      };
      service['modDataResource'].set(modData);
      spyOn(service, 'modI18n').and.returnValue(mockModI18n);
      TestBed.tick();

      const result = service.dataset();
      expect(result.categoryIds.length).toBeGreaterThan(0);
      expect(Object.keys(result.categoryRecord).length).toEqual(
        result.categoryIds.length,
      );
      expect(Object.keys(result.itemCategoryRows).length).toEqual(
        result.categoryIds.length,
      );
      expect(result.iconIds.length).toBeGreaterThan(0);
      expect(result.iconRecord).toBeDefined();
      expect(result.itemIds.length).toBeGreaterThan(0);
      expect(result.beltIds.length).toBeGreaterThan(0);
      expect(Object.keys(result.fuelIds).length).toBeGreaterThan(0);
      expect(result.machineIds.length).toBeGreaterThan(0);
      expect(result.moduleIds.length).toBeGreaterThan(0);
      expect(result.proliferatorModuleIds.length).toEqual(1);
      expect(Object.keys(result.itemRecord).length).toEqual(
        result.itemIds.length,
      );
      expect(result.recipeIds.length).toBeGreaterThan(0);
      expect(Object.keys(result.recipeRecord).length).toEqual(
        result.recipeIds.length,
      );
    });

    it('should sort beacons, belts, wagons, and fuels', () => {
      const modData = {
        ...mockModData,
        items: [
          ...mockModData.items,
          {
            id: 'id',
            icon: ItemId.Coal,
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
      };
      service['modDataResource'].set(modData);
      TestBed.tick();

      const result = service.dataset();
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

    //   it('should handle pipes when found', () => {
    //     const items = Mocks.mod.items.map((i) => {
    //       if (i.id === ItemId.Pipe) return spread(i, { pipe: { speed: 100 } });
    //       else if (i.id === ItemId.CopperCable)
    //         return spread(i, { pipe: { speed: 10 } });
    //       else return spread(i);
    //     });
    //     spyOn(service, 'mod').and.returnValue(spread(Mocks.mod, { items }));
    //     const result = service.dataset();
    //     expect(result.pipeIds).toEqual([ItemId.CopperCable, ItemId.Pipe]);
    //   });

    //   it('should calculate missing recipe icons', () => {
    //     const icons = Mocks.mod.icons.filter(
    //       (i) => i.id !== RecipeId.AdvancedOilProcessing,
    //     );
    //     spyOn(service, 'mod').and.returnValue(spread(Mocks.mod, { icons }));
    //     const result = service.dataset();
    //     expect(
    //       result.recipeEntities[RecipeId.AdvancedOilProcessing].icon,
    //     ).toEqual(ItemId.HeavyOil);
    //   });

    //   it('should handle data not loaded yet', () => {
    //     spyOn(service, 'mod').and.returnValue(undefined);
    //     const result = service.dataset();
    //     expect(result.categoryIds.length).toEqual(0);
    //   });

    //   it('should handle quality', () => {
    //     const items = Mocks.mod.items.map((i) =>
    //       i.id === ItemId.ElectricMiningDrill
    //         ? spread(i, {
    //             machine: spread(i.machine!, { entityType: 'mining-drill' }),
    //           })
    //         : i.id === ItemId.AssemblingMachine1
    //           ? spread(i, {
    //               machine: spread(i.machine!, {
    //                 entityType: 'assembling-machine',
    //               }),
    //             })
    //           : i.id === ItemId.Pump
    //             ? spread(i, { pipe: { speed: 1200 } })
    //             : i.id === ItemId.SpeedModule
    //               ? spread(i, { module: { quality: 0.1 } })
    //               : i,
    //     );
    //     spyOn(service, 'mod').and.returnValue(
    //       spread(Mocks.mod, { flags: 'spa', items }),
    //     );
    //     spyOn(service, 'i18n').and.returnValue(Mocks.modI18n);
    //     const result = service.dataset();
    //     expect(result.categoryIds.length).toBeGreaterThan(0);
    //     expect(Object.keys(result.categoryEntities).length).toEqual(
    //       result.categoryIds.length,
    //     );
    //     expect(Object.keys(result.categoryItemRows).length).toEqual(
    //       result.categoryIds.length,
    //     );
    //     expect(result.iconIds.length).toBeGreaterThan(0);
    //     expect(Object.keys(result.iconEntities).length).toEqual(
    //       result.iconIds.length,
    //     );
    //     expect(result.itemIds.length).toBeGreaterThan(0);
    //     expect(result.beltIds.length).toBeGreaterThan(0);
    //     expect(Object.keys(result.fuelIds).length).toBeGreaterThan(0);
    //     expect(result.machineIds.length).toBeGreaterThan(0);
    //     expect(result.moduleIds.length).toBeGreaterThan(0);
    //     expect(Object.keys(result.itemEntities).length).toEqual(
    //       result.itemIds.length,
    //     );
    //     expect(result.recipeIds.length).toBeGreaterThan(0);
    //     expect(Object.keys(result.recipeEntities).length).toEqual(
    //       result.recipeIds.length,
    //     );
    //   });

    //   it('should build list of recipes that allow prod upgrades', () => {
    //     const items = Mocks.mod.items.map((i) =>
    //       i.id === ItemId.ArtilleryShellRange
    //         ? spread(i, { technology: { prodUpgrades: [RecipeId.SteelChest] } })
    //         : i,
    //     );
    //     spyOn(service, 'mod').and.returnValue(
    //       spread(Mocks.mod, { items, flags: 'spa' }),
    //     );
    //     const result = service.dataset();
    //     expect(result.prodUpgradeTechs).toEqual([ItemId.ArtilleryShellRange]);
    //   });
  });

  describe('settings', () => {
    it('should overwrite defaults when specified', () => {
      const value: any = {
        modId: '1.1',
        beltId: ItemId.FastTransportBelt,
        pipeId: ItemId.Pipe,
        cargoWagonId: ItemId.CargoWagon,
        fluidWagonId: ItemId.FluidWagon,
        excludedRecipeIds: new Set(['excludedRecipes']),
        machineRankIds: [ItemId.AssemblingMachine2],
        fuelRankIds: [ItemId.Coal],
        moduleRankIds: [ItemId.SpeedModule],
      };
      spyOn(service, 'state').and.returnValue(value);
      const result = service.settings();
      for (const key of Object.keys(value) as (keyof Settings)[])
        expect(result[key]).toEqual(value[key]);
      expect(result.quality).toBeUndefined();
    });

    //   it('should fall back if setting and defaults are undefined', () => {
    //     spyOn(service, 'state').and.returnValue({} as any);
    //     const result = service.settings();
    //     expect(result.machineRankIds).toEqual([]);
    //     expect(result.fuelRankIds).toEqual([]);
    //     expect(result.moduleRankIds).toEqual([]);
    //   });

    //   it('should calculate legendary quality level', () => {
    //     const data = Mocks.getDataset();
    //     data.flags = flags.spa;
    //     data.technologyEntities[ItemId.LegendaryQuality] = {};
    //     spyOn(service, 'dataset').and.returnValue(data);
    //     spyOn(service, 'state').and.returnValue(
    //       spread(Mocks.settingsStateInitial, {
    //         researchedTechnologyIds: new Set([ItemId.LegendaryQuality]),
    //       }),
    //     );
    //     expect(service.settings().quality).toEqual(Quality.Legendary);
    //   });

    //   it('should calculate epic quality level', () => {
    //     const data = Mocks.getDataset();
    //     data.flags = flags.spa;
    //     data.technologyEntities[ItemId.EpicQuality] = {};
    //     spyOn(service, 'dataset').and.returnValue(data);
    //     spyOn(service, 'state').and.returnValue(
    //       spread(Mocks.settingsStateInitial, {
    //         researchedTechnologyIds: new Set([ItemId.EpicQuality]),
    //       }),
    //     );
    //     expect(service.settings().quality).toEqual(Quality.Epic);
    //   });

    //   it('should calculate rare quality level', () => {
    //     const data = Mocks.getDataset();
    //     data.flags = flags.spa;
    //     data.technologyEntities[ItemId.QualityModuleTechnology] = {};
    //     spyOn(service, 'dataset').and.returnValue(data);
    //     spyOn(service, 'state').and.returnValue(
    //       spread(Mocks.settingsStateInitial, {
    //         researchedTechnologyIds: new Set([ItemId.QualityModuleTechnology]),
    //       }),
    //     );
    //     expect(service.settings().quality).toEqual(Quality.Rare);
    //   });

    //   it('should filter items based on unlocked recipes', () => {
    //     const data = Mocks.getDataset();
    //     data.flags = flags.spa;
    //     const qId = ItemId.Coal + '(1)';
    //     data.itemIds.push(qId);
    //     data.noRecipeItemIds.add(qId);
    //     data.itemEntities[qId] = spread(data.itemEntities[ItemId.Coal], {
    //       quality: Quality.Uncommon,
    //     });
    //     data.recipeIds.push(qId);
    //     data.recipeEntities[qId] = spread(data.recipeEntities[ItemId.Coal], {
    //       quality: Quality.Uncommon,
    //     });
    //     spyOn(service, 'state').and.returnValue(
    //       spread(Mocks.settingsStateInitial, {
    //         preset: Preset.Beacon8,
    //         researchedTechnologyIds: new Set([ItemId.Automation]),
    //       }),
    //     );
    //     spyOn(service, 'defaults').and.returnValue(Mocks.defaults);
    //     spyOn(service, 'dataset').and.returnValue(data);
    //     const result = service.settings();
    //     expect(result.cargoWagonId).toBeUndefined();
    //     expect(result.beacons).toEqual([]);
    //   });

    //   it('should filter for recipes and machines that match locations', () => {
    //     const data = Mocks.getDataset();
    //     data.recipeEntities[RecipeId.Coal].locations = ['id2'];
    //     data.machineEntities[ItemId.ElectricMiningDrill].locations = ['id2'];
    //     spyOn(service, 'state').and.returnValue(Mocks.settingsStateInitial);
    //     spyOn(service, 'defaults').and.returnValue(Mocks.defaults);
    //     spyOn(service, 'dataset').and.returnValue(data);
    //     const result = service.settings();
    //     expect(result.availableRecipeIds.size).toEqual(data.recipeIds.length - 2);
    //     expect(result.availableItemIds.size).toEqual(data.itemIds.length);
    //   });
  });

  describe('beltSpeed', () => {
    it('should return the map of belt speeds', () => {
      const flowRate = rational(2000n);
      spyOn(service, 'flowRate').and.returnValue(flowRate);
      const result = service.beltSpeed();
      expect(result[ItemId.TransportBelt]).toEqual(
        mocks.getAdjustedDataset().beltRecord[ItemId.TransportBelt].speed,
      );
      expect(result[ItemId.Pipe]).toEqual(flowRate);
    });
  });

  describe('beltSpeedTxt', () => {
    it('should map belt speeds to appropriate rounded values for tooltips', () => {
      spyOn(service, 'beltSpeed').and.returnValue({
        a: rational(1n, 60n),
        b: rational(1n, 180n),
      });
      const result = service.beltSpeedTxt();
      expect(result['a']).toEqual('1');
      expect(result['b']).toEqual('0.33');
    });
  });

  describe('modMenuItem', () => {
    it('should create a mod menu item', () => {
      expect(service.modMenuItem().label).toEqual(mockModInfo.name);
    });
  });
});

import { TestBed } from '@angular/core/testing';

import { spread } from '~/helpers';
import { DisplayRate, displayRateInfo } from '~/models/enum/display-rate';
import { EnergyType } from '~/models/enum/energy-type';
import { Game } from '~/models/enum/game';
import { Language } from '~/models/enum/language';
import { Preset } from '~/models/enum/preset';
import { Quality } from '~/models/enum/quality';
import { flags } from '~/models/flags';
import { gameInfo } from '~/models/game-info';
import { rational } from '~/models/rational';
import { Settings } from '~/models/settings/settings';
import { assert, ItemId, Mocks, RecipeId, TestModule } from '~/tests';

import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let service: SettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestModule] });
    service = TestBed.inject(SettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('mod', () => {
    it('should handle nullish values', () => {
      spyOn(service, 'modId').and.returnValue(undefined);
      expect(service.mod()).toBeUndefined();
    });

    it('should get the base dataset', () => {
      expect(service.mod()).toEqual(Mocks.mod);
    });
  });

  describe('hash', () => {
    it('should handle nullish values', () => {
      spyOn(service, 'modId').and.returnValue(undefined);
      expect(service.hash()).toBeUndefined();
    });

    it('should get the base hash', () => {
      expect(service.hash()).toEqual(Mocks.modHash);
    });
  });

  describe('i18n', () => {
    it('should handle nullish values', () => {
      spyOn(service, 'modId').and.returnValue(undefined);
      expect(service.i18n()).toBeUndefined();
    });

    it('should get the base i18n', () => {
      spyOn(service.preferencesSvc, 'language').and.returnValue(
        Language.Chinese,
      );
      expect(service.i18n()).toEqual(Mocks.modI18n);
    });
  });

  describe('game', () => {
    it('should return the game or Factorio', () => {
      expect(service.game()).toEqual(Game.Factorio);
    });
  });

  describe('modStates', () => {
    it('should return the game states', () => {
      spyOn(service.preferencesSvc, 'states').and.returnValue(
        Mocks.preferencesState.states,
      );
      expect(service.modStates()).toEqual(
        Mocks.preferencesState.states[Mocks.modId],
      );
    });
  });

  describe('stateOptions', () => {
    it('should return empty if mod is not yet set', () => {
      spyOn(service, 'modId').and.returnValue(undefined);
      expect(service.modStates()).toEqual({});
    });

    it('should return the options as a list', () => {
      spyOn(service.preferencesSvc, 'states').and.returnValue(
        Mocks.preferencesState.states,
      );
      expect(service.stateOptions()).toEqual([
        { label: 'name', value: 'name' },
      ]);
    });
  });

  describe('gameInfo', () => {
    it('should return the game info', () => {
      expect(service.gameInfo()).toEqual(gameInfo[Game.Factorio]);
    });
  });

  describe('columnOptions', () => {
    it('should return column options', () => {
      expect(service.columnOptions().length).toEqual(10);
    });
  });

  describe('displayRateInfo', () => {
    it('should return the display rate info', () => {
      expect(service.displayRateInfo()).toEqual(
        displayRateInfo[DisplayRate.PerMinute],
      );
    });
  });

  describe('objectiveUnitOptions', () => {
    it('should return the list of options', () => {
      expect(service.objectiveUnitOptions().length).toEqual(4);
    });
  });

  describe('presetOptions', () => {
    it('should return the list of preset options', () => {
      expect(service.presetOptions().length).toEqual(4);
    });
  });

  describe('linkValueOptions', () => {
    it('should return the list of link value options', () => {
      expect(service.linkValueOptions().length).toEqual(6);
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

  describe('defaults', () => {
    it('should handle null base data', () => {
      spyOn(service, 'mod').and.returnValue(undefined);
      expect(service.defaults()).toBeUndefined();
    });

    it('should use minimum values', () => {
      spyOn(service, 'preset').and.returnValue(Preset.Minimum);
      const result = service.defaults();
      assert(result != null);
      const defaults = Mocks.mod.defaults as any;
      expect(result.beltId).toEqual(defaults.minBelt);
      expect(result.machineRankIds).toEqual(defaults.minMachineRank);
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
      spyOn(service, 'preset').and.returnValue(Preset.Beacon12);
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
      spyOn(service, 'mod').and.returnValue(
        spread(Mocks.mod, { game: Game.DysonSphereProgram }),
      );
      spyOn(service, 'preset').and.returnValue(Preset.Minimum);
      const result = service.defaults();
      assert(result != null);
      expect(result.moduleRankIds).toEqual([]);
    });

    it('should handle DSP maximum module rank', () => {
      spyOn(service, 'mod').and.returnValue(
        spread(Mocks.mod, { game: Game.DysonSphereProgram }),
      );
      const result = service.defaults();
      assert(result != null);
      expect(result.moduleRankIds).toEqual(Mocks.mod.defaults!.moduleRank!);
    });

    it('should handle Satisfactory module rank', () => {
      spyOn(service, 'mod').and.returnValue(
        spread(Mocks.mod, { game: Game.Satisfactory }),
      );
      const result = service.defaults();
      assert(result != null);
      expect(result.moduleRankIds).toEqual(Mocks.defaults.moduleRankIds);
      expect(result.overclock).toEqual(rational(100n));
    });

    it('should handle Final Factory module rank', () => {
      spyOn(service, 'mod').and.returnValue(
        spread(Mocks.mod, { game: Game.FinalFactory }),
      );
      const result = service.defaults();
      assert(result != null);
      expect(result.moduleRankIds).toEqual(Mocks.defaults.moduleRankIds);
    });
    it('should handle custom presets', () => {
      spyOn(service, 'mod').and.returnValue(
        spread(Mocks.mod, {
          defaults: spread(Mocks.mod.defaults, {
            presets: [{ id: 1, label: 'label', fuelRank: ['test'] }],
          }),
        }),
      );
      const result = service.defaults();
      assert(result != null);
      expect(result.fuelRankIds).toEqual(['test']);
    });
  });

  describe('dataset', () => {
    it('should return a complete dataset for the base and mods', () => {
      spyOn(service, 'mod').and.returnValue(
        spread(Mocks.mod, {
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
        }),
      );
      spyOn(service, 'i18n').and.returnValue(Mocks.modI18n);
      const result = service.dataset();
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
      spyOn(service, 'mod').and.returnValue(
        spread(Mocks.mod, {
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
        }),
      );
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

    it('should handle pipes when found', () => {
      const items = Mocks.mod.items.map((i) => {
        if (i.id === ItemId.Pipe) return spread(i, { pipe: { speed: 100 } });
        else if (i.id === ItemId.CopperCable)
          return spread(i, { pipe: { speed: 10 } });
        else return spread(i);
      });
      spyOn(service, 'mod').and.returnValue(spread(Mocks.mod, { items }));
      const result = service.dataset();
      expect(result.pipeIds).toEqual([ItemId.CopperCable, ItemId.Pipe]);
    });

    it('should calculate missing recipe icons', () => {
      const icons = Mocks.mod.icons.filter(
        (i) => i.id !== RecipeId.AdvancedOilProcessing,
      );
      spyOn(service, 'mod').and.returnValue(spread(Mocks.mod, { icons }));
      const result = service.dataset();
      expect(
        result.recipeEntities[RecipeId.AdvancedOilProcessing].icon,
      ).toEqual(ItemId.HeavyOil);
    });

    it('should handle data not loaded yet', () => {
      spyOn(service, 'mod').and.returnValue(undefined);
      const result = service.dataset();
      expect(result.categoryIds.length).toEqual(0);
    });

    it('should handle quality', () => {
      const items = Mocks.mod.items.map((i) =>
        i.id === ItemId.ElectricMiningDrill
          ? spread(i, {
              machine: spread(i.machine!, { entityType: 'mining-drill' }),
            })
          : i.id === ItemId.AssemblingMachine1
            ? spread(i, {
                machine: spread(i.machine!, {
                  entityType: 'assembling-machine',
                }),
              })
            : i.id === ItemId.Pump
              ? spread(i, { pipe: { speed: 1200 } })
              : i.id === ItemId.SpeedModule
                ? spread(i, { module: { quality: 0.1 } })
                : i,
      );
      spyOn(service, 'mod').and.returnValue(
        spread(Mocks.mod, { flags: 'spa', items }),
      );
      spyOn(service, 'i18n').and.returnValue(Mocks.modI18n);
      const result = service.dataset();
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
      expect(Object.keys(result.itemEntities).length).toEqual(
        result.itemIds.length,
      );
      expect(result.recipeIds.length).toBeGreaterThan(0);
      expect(Object.keys(result.recipeEntities).length).toEqual(
        result.recipeIds.length,
      );
    });

    it('should build list of recipes that allow prod upgrades', () => {
      const items = Mocks.mod.items.map((i) =>
        i.id === ItemId.ArtilleryShellRange
          ? spread(i, { technology: { prodUpgrades: [RecipeId.SteelChest] } })
          : i,
      );
      spyOn(service, 'mod').and.returnValue(
        spread(Mocks.mod, { items, flags: 'spa' }),
      );
      const result = service.dataset();
      expect(result.prodUpgradeTechs).toEqual([ItemId.ArtilleryShellRange]);
    });
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
      expect(result.quality).toEqual(Quality.Normal);
    });

    it('should fall back if setting and defaults are undefined', () => {
      spyOn(service, 'state').and.returnValue({} as any);
      const result = service.settings();
      expect(result.machineRankIds).toEqual([]);
      expect(result.fuelRankIds).toEqual([]);
      expect(result.moduleRankIds).toEqual([]);
    });

    it('should calculate legendary quality level', () => {
      const data = Mocks.getDataset();
      data.flags = flags.spa;
      data.technologyEntities[ItemId.LegendaryQuality] = {};
      spyOn(service, 'dataset').and.returnValue(data);
      spyOn(service, 'state').and.returnValue(
        spread(Mocks.settingsStateInitial, {
          researchedTechnologyIds: new Set([ItemId.LegendaryQuality]),
        }),
      );
      expect(service.settings().quality).toEqual(Quality.Legendary);
    });

    it('should calculate epic quality level', () => {
      const data = Mocks.getDataset();
      data.flags = flags.spa;
      data.technologyEntities[ItemId.EpicQuality] = {};
      spyOn(service, 'dataset').and.returnValue(data);
      spyOn(service, 'state').and.returnValue(
        spread(Mocks.settingsStateInitial, {
          researchedTechnologyIds: new Set([ItemId.EpicQuality]),
        }),
      );
      expect(service.settings().quality).toEqual(Quality.Epic);
    });

    it('should calculate rare quality level', () => {
      const data = Mocks.getDataset();
      data.flags = flags.spa;
      data.technologyEntities[ItemId.QualityModuleTechnology] = {};
      spyOn(service, 'dataset').and.returnValue(data);
      spyOn(service, 'state').and.returnValue(
        spread(Mocks.settingsStateInitial, {
          researchedTechnologyIds: new Set([ItemId.QualityModuleTechnology]),
        }),
      );
      expect(service.settings().quality).toEqual(Quality.Rare);
    });

    it('should filter items based on unlocked recipes', () => {
      const data = Mocks.getDataset();
      data.flags = flags.spa;
      const qId = ItemId.Coal + '(1)';
      data.itemIds.push(qId);
      data.noRecipeItemIds.add(qId);
      data.itemEntities[qId] = spread(data.itemEntities[ItemId.Coal], {
        quality: Quality.Uncommon,
      });
      data.recipeIds.push(qId);
      data.recipeEntities[qId] = spread(data.recipeEntities[ItemId.Coal], {
        quality: Quality.Uncommon,
      });
      spyOn(service, 'state').and.returnValue(
        spread(Mocks.settingsStateInitial, {
          preset: Preset.Beacon8,
          researchedTechnologyIds: new Set([ItemId.Automation]),
        }),
      );
      spyOn(service, 'defaults').and.returnValue(Mocks.defaults);
      spyOn(service, 'dataset').and.returnValue(data);
      const result = service.settings();
      expect(result.cargoWagonId).toBeUndefined();
      expect(result.beacons).toEqual([]);
    });

    it('should filter for recipes and machines that match locations', () => {
      const data = Mocks.getDataset();
      data.recipeEntities[RecipeId.Coal].locations = ['id2'];
      data.machineEntities[ItemId.ElectricMiningDrill].locations = ['id2'];
      spyOn(service, 'state').and.returnValue(Mocks.settingsStateInitial);
      spyOn(service, 'defaults').and.returnValue(Mocks.defaults);
      spyOn(service, 'dataset').and.returnValue(data);
      const result = service.settings();
      expect(result.availableRecipeIds.size).toEqual(data.recipeIds.length - 2);
      expect(result.availableItemIds.size).toEqual(data.itemIds.length);
    });
  });

  describe('options', () => {
    it('should return options', () => {
      const result = service.options();
      expect(result.categories.length).toBeGreaterThan(0);
    });
  });

  describe('beltSpeed', () => {
    it('should return the map of belt speeds', () => {
      const flowRate = rational(2000n);
      spyOn(service, 'flowRate').and.returnValue(flowRate);
      const result = service.beltSpeed();
      expect(result[ItemId.TransportBelt]).toEqual(
        Mocks.adjustedDataset.beltEntities[ItemId.TransportBelt].speed,
      );
      expect(result[ItemId.Pipe]).toEqual(flowRate);
    });

    it('should include pipe speeds', () => {
      const data = spread(Mocks.adjustedDataset, {
        pipeIds: [ItemId.Pipe],
        beltEntities: spread(Mocks.adjustedDataset.beltEntities, {
          [ItemId.Pipe]: spread(
            Mocks.adjustedDataset.beltEntities[ItemId.Pipe],
            { speed: rational(10n) },
          ),
        }),
      });
      spyOn(service, 'dataset').and.returnValue(data);
      const result = service.beltSpeed();
      expect(result[ItemId.Pipe]).toEqual(rational(10n));
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
      expect(service.modMenuItem().label).toEqual(Mocks.mod.name);
    });
  });
});

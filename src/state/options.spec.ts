import { TestBed } from '@angular/core/testing';

import { rational } from '~/rational/rational';
import { ItemId } from '~/tests/item-id';
import { Mocks } from '~/tests/mocks/mocks';
import { RecipeId } from '~/tests/recipe-id';
import { TestModule } from '~/tests/test-module';
import { spread } from '~/utils/object';

import { Options } from './options';
import { RecipesStore } from './recipes/recipes-store';
import { SettingsStore } from './settings/settings-store';

describe('Options', () => {
  let service: Options;
  let settingsStore: SettingsStore;
  let recipesStore: RecipesStore;
  let mocks: Mocks;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestModule] });
    service = TestBed.inject(Options);
    settingsStore = TestBed.inject(SettingsStore);
    recipesStore = TestBed.inject(RecipesStore);
    mocks = TestBed.inject(Mocks);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  describe('bestMatch', () => {
    it('should pick the first option if list only contains one', () => {
      const value = 'value';
      const result = service.bestMatch([{ value, label: '' }], []);
      expect(result).toEqual(value);
    });

    it('should pick the first match from rank', () => {
      const value = 'value';
      const result = service.bestMatch(
        [
          { value: 'test1', label: '' },
          { value, label: '' },
        ],
        ['test2', value],
      );
      expect(result).toEqual(value);
    });
  });

  describe('machineOptions', () => {
    it('should filter the list of producers', () => {
      const result = service.machineOptions(
        settingsStore.dataset().recipeRecord[RecipeId.Coal],
        settingsStore.settings(),
        recipesStore.adjustedDataset(),
      );
      expect(result.length).toEqual(2);
    });

    it('should fall back to full list of producers if none available', () => {
      const settings = spread(settingsStore.settings(), {
        availableItemIds: new Set(),
      });
      const result = service.machineOptions(
        settingsStore.dataset().recipeRecord[RecipeId.Coal],
        settings,
        recipesStore.adjustedDataset(),
      );
      expect(result.length).toEqual(2);
    });

    it('should filter for producers allowed at the current locations', () => {
      const data = mocks.getDataset();
      data.machineRecord[ItemId.BurnerMiningDrill].locations = ['id'];
      const recipe = data.recipeRecord[RecipeId.Coal];
      const result = service.machineOptions(
        recipe,
        settingsStore.settings(),
        data,
      );
      expect(result.length).toEqual(1);
    });

    it('should return an empty array if producers are nullish', () => {
      const data = mocks.getDataset();
      const recipe = data.recipeRecord[RecipeId.Coal];
      recipe.producers = undefined;
      const result = service.machineOptions(
        recipe,
        settingsStore.settings(),
        data,
      );
      expect(result).toEqual([]);
    });
  });

  describe('fuelOptions', () => {
    it('should handle Record with no fuel categories', () => {
      const result = service.fuelOptions(
        {},
        settingsStore.settings(),
        recipesStore.adjustedDataset(),
      );
      expect(result).toEqual([]);
    });

    it('should handle entity that specifies a fuel', () => {
      const result = service.fuelOptions(
        { fuel: ItemId.Coal },
        settingsStore.settings(),
        recipesStore.adjustedDataset(),
      );
      expect(result).toEqual([{ value: ItemId.Coal, label: 'Coal' }]);
    });
  });

  describe('moduleOptions', () => {
    it('should filter disallowed effects', () => {
      const result = service.moduleOptions(
        spread(settingsStore.dataset().beaconRecord[ItemId.Beacon], {
          disallowedEffects: ['speed', 'consumption'],
        }),
        settingsStore.settings(),
        settingsStore.dataset(),
      );
      expect(result).toHaveSize(4);
    });

    it('should filter recipe disallowed effects', () => {
      const data = mocks.getDataset();
      data.recipeRecord[RecipeId.Coal].disallowedEffects = [
        'speed',
        'consumption',
      ];
      const result = service.moduleOptions(
        data.beaconRecord[ItemId.Beacon],
        settingsStore.settings(),
        data,
        RecipeId.Coal,
      );
      expect(result).toHaveSize(1);
    });

    it('should disallow empty module in Satisfactory mining', () => {
      const result = service.moduleOptions(
        settingsStore.dataset().machineRecord[ItemId.AssemblingMachine3],
        settingsStore.settings(),
        spread(settingsStore.dataset(), {
          flags: new Set([
            'consumptionAsDrain',
            'overclock',
            'power',
            'resourcePurity',
            'somersloop',
          ]),
        }),
        RecipeId.Coal,
      );
      expect(result).toHaveSize(9);
    });

    it('should enforce limitations', () => {
      const data = mocks.getDataset();
      data.flags = new Set(['miningTechnologyBypassLimitations']);
      data.limitations = { [ItemId.ProductivityModule]: {} };
      data.moduleRecord[ItemId.ProductivityModule].limitation =
        ItemId.ProductivityModule;
      const result = service.moduleOptions(
        spread(settingsStore.dataset().beaconRecord[ItemId.Beacon], {
          disallowedEffects: ['speed', 'consumption'],
        }),
        settingsStore.settings(),
        data,
        RecipeId.ElectronicCircuit,
      );
      expect(result).toHaveSize(3);
    });
  });

  describe('defaultModules', () => {
    it('should fill in modules list for machine', () => {
      const result = service.defaultModules(
        [{ value: ItemId.SpeedModule, label: '' }],
        [ItemId.ProductivityModule, ItemId.SpeedModule],
        rational.one,
      );
      expect(result).toEqual([{ count: rational.one, id: ItemId.SpeedModule }]);
    });

    it('should handle unlimited modules', () => {
      const result = service.defaultModules(
        [{ value: ItemId.SpeedModule, label: '' }],
        [ItemId.ProductivityModule, ItemId.SpeedModule],
        true,
      );
      expect(result).toEqual([
        { count: rational.zero, id: ItemId.SpeedModule },
      ]);
    });

    it('should handle nullish count', () => {
      expect(service.defaultModules([], [], undefined)).toBeUndefined();
    });
  });
});

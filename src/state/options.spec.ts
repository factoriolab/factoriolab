import { TestBed } from '@angular/core/testing';

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

    xit('should filter for producers allowed at the current locations', () => {
      const data = mocks.getDataset();
      data.machineRecord[ItemId.BurnerMiningDrill].locations = ['id2'];
      data.machineRecord[ItemId.ElectricMiningDrill].locations = ['id'];
      const recipe = data.recipeRecord[RecipeId.Coal];
      const result = service.machineOptions(
        recipe,
        settingsStore.settings(),
        data,
      );
      console.log(result);
      expect(result.length).toEqual(1);
    });
  });
});

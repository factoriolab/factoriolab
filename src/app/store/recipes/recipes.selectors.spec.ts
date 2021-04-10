import { Mocks, ItemId } from 'src/tests';
import { initialRecipesState } from './recipes.reducer';
import * as Selectors from './recipes.selectors';

describe('Recipes Selectors', () => {
  const stringValue = 'value';
  const numberValue = 2;

  describe('getRecipeSettings', () => {
    it('should handle null/empty values', () => {
      const result = Selectors.getRecipeSettings.projector({}, null, null);
      expect(Object.keys(result).length).toEqual(0);
    });

    it('should handle empty recipes', () => {
      const result = Selectors.getRecipeSettings.projector({}, null, {
        recipeIds: [],
      });
      expect(Object.keys(result).length).toEqual(0);
    });

    it('should return the recipe settings', () => {
      const result = Selectors.getRecipeSettings.projector(
        initialRecipesState,
        Mocks.FactorySettingsInitial,
        Mocks.Data
      );
      expect(Object.keys(result).length).toEqual(Mocks.Data.recipeIds.length);
    });

    it('should use factory override', () => {
      const state = {
        ...initialRecipesState,
        ...{ [Mocks.Item1.id]: { factory: stringValue } },
      };
      const result = Selectors.getRecipeSettings.projector(
        state,
        Mocks.FactorySettingsInitial,
        Mocks.Data
      );
      expect(result[Mocks.Item1.id].factory).toEqual(stringValue);
    });

    it('should use module override', () => {
      const state = {
        ...initialRecipesState,
        ...{ [Mocks.Item1.id]: { factoryModules: [stringValue] } },
      };
      const result = Selectors.getRecipeSettings.projector(
        state,
        Mocks.FactorySettingsInitial,
        Mocks.Data
      );
      expect(result[Mocks.Item1.id].factoryModules).toEqual([stringValue]);
    });

    it('should use beacon count override', () => {
      const state = {
        ...initialRecipesState,
        ...{ [Mocks.Item1.id]: { beaconCount: stringValue } },
      };
      const result = Selectors.getRecipeSettings.projector(
        state,
        Mocks.FactorySettingsInitial,
        Mocks.Data
      );
      expect(result[Mocks.Item1.id].beaconCount).toEqual(stringValue);
    });

    it('should use beacon override', () => {
      const state = {
        ...initialRecipesState,
        ...{ [Mocks.Item1.id]: { beacon: stringValue } },
      };
      const result = Selectors.getRecipeSettings.projector(
        state,
        Mocks.FactorySettingsInitial,
        Mocks.Data
      );
      expect(result[Mocks.Item1.id].beacon).toEqual(stringValue);
    });

    it('should use beacon module override', () => {
      const state = {
        ...initialRecipesState,
        ...{ [Mocks.Item1.id]: { beaconModules: [stringValue] } },
      };
      const result = Selectors.getRecipeSettings.projector(
        state,
        Mocks.FactorySettingsInitial,
        Mocks.Data
      );
      expect(result[Mocks.Item1.id].beaconModules).toEqual([stringValue]);
    });
  });

  describe('getContainsFactory', () => {
    it('should handle null/empty values', () => {
      const result = Selectors.getContainsFactory.projector({});
      expect(result).toBeFalse();
    });

    it('should find a relevant step by factory', () => {
      const result = Selectors.getContainsFactory.projector({
        ['id']: { factory: ItemId.AssemblingMachine1 },
      });
      expect(result).toBeTrue();
    });

    it('should find a relevant step by factory modules', () => {
      const result = Selectors.getContainsFactory.projector({
        ['id']: { factoryModules: [ItemId.SpeedModule] },
      });
      expect(result).toBeTrue();
    });
  });

  describe('getContainsBeacons', () => {
    it('should handle null/empty values', () => {
      const result = Selectors.getContainsBeacons.projector({});
      expect(result).toBeFalse();
    });

    it('should find a relevant step by beacon count', () => {
      const result = Selectors.getContainsBeacons.projector({
        ['id']: { beaconCount: 0 },
      });
      expect(result).toBeTrue();
    });

    it('should find a relevant step by beacon', () => {
      const result = Selectors.getContainsBeacons.projector({
        ['id']: { beacon: 'beacon' },
      });
      expect(result).toBeTrue();
    });

    it('should find a relevant step by beacon modules', () => {
      const result = Selectors.getContainsBeacons.projector({
        ['id']: { beaconModules: [ItemId.SpeedModule] },
      });
      expect(result).toBeTrue();
    });
  });
});

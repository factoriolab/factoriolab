import { Mocks, ItemId } from 'src/tests';
import { initialRecipesState } from './recipes.reducer';
import * as Selectors from './recipes.selectors';

describe('Recipes Selectors', () => {
  const stringValue = 'value';
  const numberValue = 2;

  describe('getRecipeSettings', () => {
    it('should handle null/empty values', () => {
      const result = Selectors.getRecipeSettings.projector(
        {},
        [],
        [],
        null,
        null,
        null,
        null
      );
      expect(Object.keys(result).length).toEqual(0);
    });

    it('should handle empty recipes', () => {
      const result = Selectors.getRecipeSettings.projector(
        {},
        [],
        [],
        null,
        null,
        null,
        { recipeIds: [] }
      );
      expect(Object.keys(result).length).toEqual(0);
    });

    it('should return the recipe settings', () => {
      const result = Selectors.getRecipeSettings.projector(
        initialRecipesState,
        Mocks.InitialSettingsState.factoryRank,
        Mocks.InitialSettingsState.moduleRank,
        Mocks.InitialSettingsState.beaconModule,
        Mocks.InitialSettingsState.beaconCount,
        Mocks.InitialSettingsState.drillModule,
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
        Mocks.InitialSettingsState.factoryRank,
        Mocks.InitialSettingsState.moduleRank,
        Mocks.InitialSettingsState.beaconModule,
        Mocks.InitialSettingsState.beaconCount,
        Mocks.InitialSettingsState.drillModule,
        Mocks.Data
      );
      expect(result[Mocks.Item1.id].factory).toEqual(stringValue);
    });

    it('should use module override', () => {
      const state = {
        ...initialRecipesState,
        ...{ [Mocks.Item1.id]: { modules: [stringValue] } },
      };
      const result = Selectors.getRecipeSettings.projector(
        state,
        Mocks.InitialSettingsState.factoryRank,
        Mocks.InitialSettingsState.moduleRank,
        Mocks.InitialSettingsState.beaconModule,
        Mocks.InitialSettingsState.beaconCount,
        Mocks.InitialSettingsState.drillModule,
        Mocks.Data
      );
      expect(result[Mocks.Item1.id].modules as string[]).toEqual([stringValue]);
    });

    it('should use beacon type override', () => {
      const state = {
        ...initialRecipesState,
        ...{ [Mocks.Item1.id]: { beaconModule: stringValue } },
      };
      const result = Selectors.getRecipeSettings.projector(
        state,
        Mocks.InitialSettingsState.factoryRank,
        Mocks.InitialSettingsState.moduleRank,
        Mocks.InitialSettingsState.beaconModule,
        Mocks.InitialSettingsState.beaconCount,
        Mocks.InitialSettingsState.drillModule,
        Mocks.Data
      );
      expect(result[Mocks.Item1.id].beaconModule).toEqual(stringValue);
    });

    it('should use beacon count override', () => {
      const state = {
        ...initialRecipesState,
        ...{ [Mocks.Item1.id]: { beaconCount: numberValue } },
      };
      const result = Selectors.getRecipeSettings.projector(
        state,
        Mocks.InitialSettingsState.factoryRank,
        Mocks.InitialSettingsState.moduleRank,
        Mocks.InitialSettingsState.beaconModule,
        Mocks.InitialSettingsState.beaconCount,
        Mocks.InitialSettingsState.drillModule,
        Mocks.Data
      );
      expect(result[Mocks.Item1.id].beaconCount).toEqual(numberValue);
    });
  });

  describe('getContainsFactory', () => {
    it('should handle null/empty values', () => {
      const result = Selectors.getContainsFactory.projector({});
      expect(result).toBeFalse();
    });

    it('should find a relevant step', () => {
      const result = Selectors.getContainsFactory.projector({
        ['id']: { factory: ItemId.AssemblingMachine1 },
      });
      expect(result).toBeTrue();
    });
  });

  describe('getContainsModules', () => {
    it('should handle null/empty values', () => {
      const result = Selectors.getContainsModules.projector({});
      expect(result).toBeFalse();
    });

    it('should find a relevant step', () => {
      const result = Selectors.getContainsModules.projector({
        ['id']: { modules: [ItemId.SpeedModule] },
      });
      expect(result).toBeTrue();
    });
  });

  describe('getContainsBeacons', () => {
    it('should handle null/empty values', () => {
      const result = Selectors.getContainsBeacons.projector({});
      expect(result).toBeFalse();
    });

    it('should find a relevant step by module', () => {
      const result = Selectors.getContainsBeacons.projector({
        ['id']: { beaconModule: ItemId.SpeedModule },
      });
      expect(result).toBeTrue();
    });

    it('should find a relevant step by count', () => {
      const result = Selectors.getContainsBeacons.projector({
        ['id']: { beaconCount: 0 },
      });
      expect(result).toBeTrue();
    });
  });
});

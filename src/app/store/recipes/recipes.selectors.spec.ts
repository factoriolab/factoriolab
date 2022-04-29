import { ItemId, Mocks, RecipeId } from 'src/tests';
import { Rational } from '~/models';
import { RecipeUtility } from '~/utilities';
import { initialRecipesState } from './recipes.reducer';
import * as Selectors from './recipes.selectors';

describe('Recipes Selectors', () => {
  const stringValue = 'value';

  describe('Base selector functions', () => {
    it('should get slices of state', () => {
      expect(
        Selectors.recipesState({
          recipesState: Mocks.RecipeSettingsInitial,
        } as any)
      ).toEqual(Mocks.RecipeSettingsInitial);
    });
  });

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

    it('should handle null settings', () => {
      const state = {
        ...initialRecipesState,
        ...{ [Mocks.Item1.id]: { factory: ItemId.AssemblingMachine3 } },
      };
      const data = {
        ...Mocks.Data,
        ...{
          factoryEntities: {
            ...Mocks.Data.factoryEntities,
            ...{
              [ItemId.AssemblingMachine3]: {
                ...Mocks.Data.factoryEntities[ItemId.AssemblingMachine3],
                ...{ modules: undefined },
              },
            },
          },
        },
      };
      spyOn(RecipeUtility, 'allowsModules').and.returnValue(true);
      const result = Selectors.getRecipeSettings.projector(
        state,
        {
          ...Mocks.FactorySettingsInitial,
          ...{
            ids: undefined,
            entities: {
              ...Mocks.FactorySettingsInitial.entities,
              ...{ [ItemId.AssemblingMachine3]: {} },
            },
          },
        },
        data
      );
      expect(result[Mocks.Item1.id].factory).toEqual(ItemId.AssemblingMachine3);
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

    it('should reset invalid beacon totals', () => {
      const state = {
        ...initialRecipesState,
        ...{ [Mocks.Item1.id]: { beaconTotal: '8', beaconCount: '0' } },
      };
      const result = Selectors.getRecipeSettings.projector(
        state,
        Mocks.FactorySettingsInitial,
        Mocks.Data
      );
      expect(result[Mocks.Item1.id].beaconTotal).toBeUndefined();
    });
  });

  describe('getSrc', () => {
    it('should put together the required state parts', () => {
      const result = Selectors.getSrc.projector(
        ItemId.Coal,
        Rational.zero,
        Rational.one,
        Mocks.Data
      );
      expect(result).toEqual({
        fuel: ItemId.Coal,
        miningBonus: Rational.zero,
        researchSpeed: Rational.one,
        data: Mocks.Data,
      });
    });
  });

  describe('getRecipesModified', () => {
    it('should determine whether columns are modified', () => {
      const result = Selectors.getRecipesModified.projector({
        [RecipeId.Coal]: {
          factory: undefined,
          factoryModules: [],
          beacon: undefined,
          beaconModules: undefined,
          beaconCount: undefined,
          beaconTotal: true,
        },
      });
      expect(result.factories).toBeTrue();
      expect(result.overclock).toBeFalse();
      expect(result.beacons).toBeTrue();
      expect(result.cost).toBeFalse();
    });
  });
});

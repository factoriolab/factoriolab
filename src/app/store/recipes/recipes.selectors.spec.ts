import { ItemId, Mocks, RecipeId } from 'src/tests';
import { Rational, RecipeObjective } from '~/models';
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
    it('should return the recipe settings', () => {
      const result = Selectors.getRecipeSettings.projector(
        initialRecipesState,
        Mocks.MachineSettingsInitial,
        Mocks.Dataset
      );
      expect(Object.keys(result).length).toEqual(
        Mocks.Dataset.recipeIds.length
      );
    });

    it('should handle null settings', () => {
      const state = {
        ...initialRecipesState,
        ...{ [Mocks.Item1.id]: { machineId: ItemId.AssemblingMachine3 } },
      };
      const data = {
        ...Mocks.Dataset,
        ...{
          machineEntities: {
            ...Mocks.Dataset.machineEntities,
            ...{
              [ItemId.AssemblingMachine3]: {
                ...Mocks.Dataset.machineEntities[ItemId.AssemblingMachine3],
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
          ...Mocks.MachineSettingsInitial,
          ...{
            ids: undefined,
            entities: {
              ...Mocks.MachineSettingsInitial.entities,
              ...{ [ItemId.AssemblingMachine3]: {} },
            },
          },
        },
        data
      );
      expect(result[Mocks.Item1.id].machineId).toEqual(
        ItemId.AssemblingMachine3
      );
    });

    it('should use machine override', () => {
      const state = {
        ...initialRecipesState,
        ...{ [Mocks.Item1.id]: { machineId: stringValue } },
      };
      const result = Selectors.getRecipeSettings.projector(
        state,
        Mocks.MachineSettingsInitial,
        Mocks.Dataset
      );
      expect(result[Mocks.Item1.id].machineId).toEqual(stringValue);
    });

    it('should use module override', () => {
      const state = {
        ...initialRecipesState,
        ...{ [Mocks.Item1.id]: { machineModuleIds: [stringValue] } },
      };
      const result = Selectors.getRecipeSettings.projector(
        state,
        Mocks.MachineSettingsInitial,
        Mocks.Dataset
      );
      expect(result[Mocks.Item1.id].machineModuleIds).toEqual([stringValue]);
    });

    it('should use beacon count override', () => {
      const state = {
        ...initialRecipesState,
        ...{ [Mocks.Item1.id]: { beacons: [{ count: stringValue }] } },
      };
      const result = Selectors.getRecipeSettings.projector(
        state,
        Mocks.MachineSettingsInitial,
        Mocks.Dataset
      );
      expect(result[Mocks.Item1.id].beacons?.[0].count).toEqual(stringValue);
    });

    it('should use beacon module override', () => {
      const state = {
        ...initialRecipesState,
        ...{ [Mocks.Item1.id]: { beacons: [{ moduleIds: [stringValue] }] } },
      };
      const machines = {
        ...Mocks.MachineSettingsInitial,
        ...{
          entities: {
            ...Mocks.MachineSettingsInitial.entities,
            ...{
              [ItemId.AssemblingMachine3]: {
                ...Mocks.MachineSettingsInitial.entities[
                  ItemId.AssemblingMachine3
                ],
                ...{
                  beaconModuleRankIds: undefined,
                },
              },
            },
          },
        },
      };
      const result = Selectors.getRecipeSettings.projector(
        state,
        machines,
        Mocks.Dataset
      );
      expect(result[Mocks.Item1.id].beacons?.[0].moduleIds).toEqual([
        stringValue,
      ]);
    });

    it('should reset invalid beacon totals', () => {
      const state = {
        ...initialRecipesState,
        ...{ [Mocks.Item1.id]: { beacons: [{ total: '8', count: '0' }] } },
      };
      const result = Selectors.getRecipeSettings.projector(
        state,
        Mocks.MachineSettingsInitial,
        Mocks.Dataset
      );
      expect(result[Mocks.Item1.id].beacons?.[0].total).toBeUndefined();
    });
  });

  describe('getSrc', () => {
    it('should put together the required state parts', () => {
      const result = Selectors.getSrc.projector(
        ItemId.Coal,
        Rational.zero,
        Rational.one,
        Mocks.Dataset
      );
      expect(result).toEqual({
        fuelId: ItemId.Coal,
        miningBonus: Rational.zero,
        researchSpeed: Rational.one,
        data: Mocks.Dataset,
      });
    });
  });

  describe('getRecipesModified', () => {
    it('should determine whether columns are modified', () => {
      const result = Selectors.getRecipesModified.projector(
        {
          [RecipeId.Coal]: {
            machineId: undefined,
            machineModuleIds: undefined,
            overclock: 100,
            beacons: [{ total: '1' }],
          },
        },
        []
      );
      expect(result.machines).toBeTrue();
      expect(result.beacons).toBeTrue();
      expect(result.cost).toBeFalse();
    });

    it('should account for producer settings', () => {
      const producer: RecipeObjective = {
        id: '1',
        recipeId: RecipeId.Coal,
        amount: '1',
        overclock: 100,
        beacons: [{ moduleIds: [] }],
      };
      const result = Selectors.getRecipesModified.projector(
        {
          [RecipeId.Coal]: {},
        },
        [producer]
      );
      expect(result.machines).toBeTrue();
      expect(result.beacons).toBeTrue();
      expect(result.cost).toBeFalse();
    });
  });
});

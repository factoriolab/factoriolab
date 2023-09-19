import { ItemId, Mocks } from 'src/tests';
import { RecipeUtility } from '~/utilities';
import { initialRecipesState } from './recipes.reducer';
import * as Selectors from './recipes.selectors';

describe('Recipes Selectors', () => {
  const stringValue = 'value';

  describe('Base selector functions', () => {
    it('should get slices of state', () => {
      expect(
        Selectors.recipesState({
          recipesState: Mocks.RecipesStateInitial,
        } as any),
      ).toEqual(Mocks.RecipesStateInitial);
    });
  });

  describe('getRecipesState', () => {
    it('should return the recipe settings', () => {
      const result = Selectors.getRecipesState.projector(
        initialRecipesState,
        Mocks.MachinesStateInitial,
        Mocks.Dataset,
      );
      expect(Object.keys(result).length).toEqual(
        Mocks.Dataset.recipeIds.length,
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
          defaults: undefined,
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
      const result = Selectors.getRecipesState.projector(
        state,
        {
          ...Mocks.MachinesStateInitial,
          ...{
            entities: {
              ...Mocks.MachinesStateInitial.entities,
              ...{ [ItemId.AssemblingMachine3]: {} },
            },
          },
        },
        data,
      );
      expect(result[Mocks.Item1.id].machineId).toEqual(
        ItemId.AssemblingMachine3,
      );
    });

    it('should use machine override', () => {
      const state = {
        ...initialRecipesState,
        ...{ [Mocks.Item1.id]: { machineId: stringValue } },
      };
      const result = Selectors.getRecipesState.projector(
        state,
        Mocks.MachinesStateInitial,
        Mocks.Dataset,
      );
      expect(result[Mocks.Item1.id].machineId).toEqual(stringValue);
    });

    it('should use module override', () => {
      const state = {
        ...initialRecipesState,
        ...{ [Mocks.Item1.id]: { machineModuleIds: [stringValue] } },
      };
      const result = Selectors.getRecipesState.projector(
        state,
        Mocks.MachinesStateInitial,
        Mocks.Dataset,
      );
      expect(result[Mocks.Item1.id].machineModuleIds).toEqual([stringValue]);
    });

    it('should use beacon count override', () => {
      const state = {
        ...initialRecipesState,
        ...{ [Mocks.Item1.id]: { beacons: [{ count: stringValue }] } },
      };
      const result = Selectors.getRecipesState.projector(
        state,
        Mocks.MachinesStateInitial,
        Mocks.Dataset,
      );
      expect(result[Mocks.Item1.id].beacons?.[0].count).toEqual(stringValue);
    });

    it('should use beacon module override', () => {
      const state = {
        ...initialRecipesState,
        ...{ [Mocks.Item1.id]: { beacons: [{ moduleIds: [stringValue] }] } },
      };
      const machines = {
        ...Mocks.MachinesStateInitial,
        ...{
          entities: {
            ...Mocks.MachinesStateInitial.entities,
            ...{
              [ItemId.AssemblingMachine3]: {
                ...Mocks.MachinesStateInitial.entities[
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
      const result = Selectors.getRecipesState.projector(
        state,
        machines,
        Mocks.Dataset,
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
      const result = Selectors.getRecipesState.projector(
        state,
        Mocks.MachinesStateInitial,
        Mocks.Dataset,
      );
      expect(result[Mocks.Item1.id].beacons?.[0].total).toBeUndefined();
    });
  });
});

import { ItemId, Mocks } from 'src/tests';
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
        Mocks.RawDataset,
      );
      expect(Object.keys(result).length).toEqual(
        Mocks.RawDataset.recipeIds.length,
      );
    });

    it('should handle null settings', () => {
      const state = {
        ...initialRecipesState,
        ...{ [Mocks.Item1.id]: { machineId: ItemId.AssemblingMachine3 } },
      };
      const data = {
        ...Mocks.RawDataset,
        ...{
          defaults: undefined,
          machineEntities: {
            ...Mocks.RawDataset.machineEntities,
            ...{
              [ItemId.AssemblingMachine3]: {
                ...Mocks.RawDataset.machineEntities[ItemId.AssemblingMachine3],
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
        Mocks.RawDataset,
      );
      expect(result[Mocks.Item1.id].machineId).toEqual(stringValue);
    });

    it('should use modules override', () => {
      const modules = [{ count: Rational.one, id: stringValue }];
      const state = {
        ...initialRecipesState,
        ...{ [Mocks.Item1.id]: { modules } },
      };
      const result = Selectors.getRecipesState.projector(
        state,
        Mocks.MachinesStateInitial,
        Mocks.RawDataset,
      );
      expect(result[Mocks.Item1.id].modules).toEqual(modules);
    });

    it('should use beacons override', () => {
      const beacons = [
        {
          count: Rational.one,
          id: stringValue,
          modules: [{ count: Rational.two, id: ItemId.Module }],
        },
      ];
      const state = {
        ...initialRecipesState,
        ...{ [Mocks.Item1.id]: { beacons } },
      };
      const result = Selectors.getRecipesState.projector(
        state,
        Mocks.MachinesStateInitial,
        Mocks.RawDataset,
      );
      expect(result[Mocks.Item1.id].beacons).toEqual(beacons);
    });

    it('should reset invalid beacon totals', () => {
      const state = {
        ...initialRecipesState,
        ...{
          [Mocks.Item1.id]: {
            beacons: [
              {
                total: Rational.from(8),
                count: Rational.zero,
                id: ItemId.Beacon,
                modules: [{ count: Rational.from(2), id: ItemId.Module }],
              },
            ],
          },
        },
      };
      const result = Selectors.getRecipesState.projector(
        state,
        Mocks.MachinesStateInitial,
        Mocks.RawDataset,
      );
      expect(result[Mocks.Item1.id].beacons?.[0].total).toBeUndefined();
    });
  });

  describe('getAvailableItems', () => {
    it('should return items with some recipe available to produce it', () => {
      const result = Selectors.getAvailableItems.projector(Mocks.Dataset);
      // Cannot produce wood in vanilla Factorio
      expect(result.length).toEqual(Mocks.RawDataset.itemIds.length - 1);
    });
  });
});

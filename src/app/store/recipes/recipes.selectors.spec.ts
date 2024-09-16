import { spread } from '~/helpers';
import { rational } from '~/models/rational';
import { ItemId, Mocks } from '~/tests';
import { RecipeUtility } from '~/utilities/recipe.utility';

import { initialRecipesState } from './recipes.reducer';
import {
  recipesState,
  selectAvailableItems,
  selectRecipesState,
} from './recipes.selectors';

describe('Recipes Selectors', () => {
  const stringValue = 'value';

  describe('Base selector functions', () => {
    it('should get slices of state', () => {
      expect(
        recipesState({
          recipesState: Mocks.recipesStateInitial,
        } as any),
      ).toEqual(Mocks.recipesStateInitial);
    });
  });

  describe('getRecipesState', () => {
    it('should return the recipe settings', () => {
      const result = selectRecipesState.projector(
        initialRecipesState,
        Mocks.machinesStateInitial,
        Mocks.settingsStateInitial,
        Mocks.adjustedDataset,
      );
      expect(Object.keys(result).length).toEqual(
        Mocks.adjustedDataset.recipeIds.length,
      );
    });

    it('should handle null settings', () => {
      const state = spread(initialRecipesState, {
        [Mocks.item1.id]: { machineId: ItemId.AssemblingMachine3 },
      });
      const data = spread(Mocks.adjustedDataset, {
        defaults: undefined,
        machineEntities: spread(Mocks.adjustedDataset.machineEntities, {
          [ItemId.AssemblingMachine3]: spread(
            Mocks.adjustedDataset.machineEntities[ItemId.AssemblingMachine3],
            { modules: undefined },
          ),
        }),
      });
      spyOn(RecipeUtility, 'allowsModules').and.returnValue(true);
      const result = selectRecipesState.projector(
        state,
        spread(Mocks.machinesStateInitial, { [ItemId.AssemblingMachine3]: {} }),
        Mocks.settingsStateInitial,
        data,
      );
      expect(result[Mocks.item1.id].machineId).toEqual(
        ItemId.AssemblingMachine3,
      );
    });

    it('should use machine override', () => {
      const state = spread(initialRecipesState, {
        [Mocks.item1.id]: { machineId: stringValue },
      });
      const result = selectRecipesState.projector(
        state,
        Mocks.machinesStateInitial,
        Mocks.settingsStateInitial,
        Mocks.adjustedDataset,
      );
      expect(result[Mocks.item1.id].machineId).toEqual(stringValue);
    });

    it('should use modules override', () => {
      const modules = [
        { count: rational.one, id: stringValue },
        { count: rational(3n), id: ItemId.Module },
      ];
      const state = spread(initialRecipesState, {
        [Mocks.item1.id]: { modules },
      });
      const result = selectRecipesState.projector(
        state,
        Mocks.machinesStateInitial,
        Mocks.settingsStateInitial,
        Mocks.dataset,
      );
      expect(result[Mocks.item1.id].modules).toEqual(modules);
    });

    it('should reset invalid beacon totals', () => {
      const state = spread(initialRecipesState, {
        [Mocks.item1.id]: {
          beacons: [
            {
              total: rational(8n),
              count: rational.zero,
              id: ItemId.Beacon,
              modules: [{ count: rational(2n), id: ItemId.Module }],
            },
          ],
        },
      });
      const result = selectRecipesState.projector(
        state,
        Mocks.machinesStateInitial,
        Mocks.settingsStateInitial,
        Mocks.dataset,
      );
      expect(result[Mocks.item1.id].beacons?.[0].total).toBeUndefined();
    });
  });

  describe('getAvailableItems', () => {
    it('should return items with some recipe available to produce it', () => {
      const result = selectAvailableItems.projector(Mocks.adjustedDataset);
      // Cannot produce wood in vanilla Factorio
      expect(result.length).toEqual(Mocks.adjustedDataset.itemIds.length - 1);
    });
  });
});

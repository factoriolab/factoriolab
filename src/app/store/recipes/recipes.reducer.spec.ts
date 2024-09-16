import { rational } from '~/models/rational';
import { RecipeSettings } from '~/models/settings/recipe-settings';
import { ItemId, Mocks } from '~/tests';
import { StoreUtility } from '~/utilities/store.utility';

import { load, reset } from '../app.actions';
import {
  resetBeacons,
  resetCost,
  resetMachines,
  resetRecipe,
  resetRecipeMachines,
  setBeacons,
  setCost,
  setFuel,
  setMachine,
  setModules,
  setOverclock,
} from './recipes.actions';
import { initialRecipesState, recipesReducer } from './recipes.reducer';

describe('Recipes Reducer', () => {
  describe('LOAD', () => {
    it('should load recipe settings', () => {
      const result = recipesReducer(
        undefined,
        load({
          partial: {
            recipesState: Mocks.recipesState,
          },
        }),
      );
      expect(result).toEqual(Mocks.recipesState);
    });

    it('should handle missing partial state', () => {
      const result = recipesReducer(undefined, load({ partial: {} }));
      expect(result).toEqual(initialRecipesState);
    });
  });

  describe('RESET', () => {
    it('should return the initial state', () => {
      const result = recipesReducer(undefined, reset());
      expect(result).toEqual(initialRecipesState);
    });
  });

  describe('SET_MACHINE', () => {
    it('should set the machine', () => {
      const result = recipesReducer(
        initialRecipesState,
        setMachine({
          id: Mocks.recipe1.id,
          value: Mocks.item1.id,
          def: undefined,
        }),
      );
      expect(result[Mocks.recipe1.id].machineId).toEqual(Mocks.item1.id);
    });

    it('should reset all other recipe settings', () => {
      const result = recipesReducer(
        {
          ...initialRecipesState,
          ...{
            [Mocks.recipe1.id]: {
              modules: [{ count: rational.one, id: ItemId.Module }],
              beacons: [
                {
                  count: rational(10n),
                  id: ItemId.Beacon,
                  modules: [{ count: rational(2n), id: ItemId.Module }],
                },
              ],
            },
          },
        },
        setMachine({
          id: Mocks.recipe1.id,
          value: Mocks.item1.id,
          def: undefined,
        }),
      );
      expect(result[Mocks.recipe1.id]).toEqual({ machineId: Mocks.item1.id });
    });
  });

  describe('SET_FUEL', () => {
    it('should set the fuel', () => {
      const result = recipesReducer(
        initialRecipesState,
        setFuel({
          id: Mocks.recipe1.id,
          value: Mocks.item1.id,
          def: undefined,
        }),
      );
      expect(result[Mocks.recipe1.id].fuelId).toEqual(Mocks.item1.id);
    });
  });

  describe('SET_MODULES', () => {
    it('should set the modules', () => {
      const value = [{ count: rational.one, id: ItemId.Module }];
      const result = recipesReducer(
        initialRecipesState,
        setModules({
          id: Mocks.recipe1.id,
          value,
        }),
      );
      expect(result[Mocks.recipe1.id].modules).toEqual(value);
    });
  });

  describe('SET_BEACONS', () => {
    it('should set the beacons', () => {
      const value = [
        {
          count: rational.one,
          id: ItemId.Beacon,
          modules: [{ count: rational(2n), id: ItemId.Module }],
        },
      ];
      const result = recipesReducer(
        initialRecipesState,
        setBeacons({
          id: Mocks.recipe1.id,
          value,
        }),
      );
      expect(result[Mocks.recipe1.id].beacons).toEqual(value);
    });
  });

  describe('SET_OVERCLOCK', () => {
    it('should set the overclock', () => {
      const value = rational(200n);
      const result = recipesReducer(
        initialRecipesState,
        setOverclock({
          id: Mocks.recipe1.id,
          value,
          def: rational(100n),
        }),
      );
      expect(result[Mocks.recipe1.id].overclock).toEqual(value);
    });
  });

  describe('SET_COST', () => {
    it('should set the cost', () => {
      const result = recipesReducer(
        initialRecipesState,
        setCost({
          id: Mocks.recipe1.id,
          value: rational(10n),
        }),
      );
      expect(result[Mocks.recipe1.id].cost).toEqual(rational(10n));
    });
  });

  describe('RESET_RECIPE', () => {
    it('should reset a recipe', () => {
      const result = recipesReducer(
        initialRecipesState,
        resetRecipe({ id: Mocks.recipe1.id }),
      );
      expect(result[Mocks.recipe1.id]).toBeUndefined();
    });
  });

  describe('RESET_RECIPE_MACHINES', () => {
    it(`should reset a recipe's modules`, () => {
      spyOn(StoreUtility, 'resetFields');
      recipesReducer(
        undefined,
        resetRecipeMachines({ ids: [Mocks.recipe1.id] }),
      );
      expect(StoreUtility.resetFields<RecipeSettings>).toHaveBeenCalledWith(
        {},
        ['fuelId', 'modules', 'beacons'],
        Mocks.recipe1.id,
      );
    });
  });

  describe('RESET_MACHINE', () => {
    it('should call resetField', () => {
      spyOn(StoreUtility, 'resetFields');
      recipesReducer(undefined, resetMachines());
      expect(StoreUtility.resetFields<RecipeSettings>).toHaveBeenCalledWith(
        {},
        ['machineId', 'fuelId', 'overclock', 'modules', 'beacons'],
      );
    });
  });

  describe('RESET_BEACONS', () => {
    it('should call resetField', () => {
      spyOn(StoreUtility, 'resetField');
      recipesReducer(undefined, resetBeacons());
      expect(StoreUtility.resetField<RecipeSettings>).toHaveBeenCalledWith(
        {},
        'beacons',
      );
    });
  });

  describe('RESET_COST', () => {
    it('should call resetField', () => {
      spyOn(StoreUtility, 'resetField');
      recipesReducer(undefined, resetCost());
      expect(StoreUtility.resetField<RecipeSettings>).toHaveBeenCalledWith(
        {},
        'cost',
      );
    });
  });
});

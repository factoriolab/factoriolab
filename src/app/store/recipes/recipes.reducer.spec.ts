import { rational, RecipeSettings } from '~/models';
import { ItemId, Mocks } from '~/tests';
import { StoreUtility } from '~/utilities';

import * as App from '../app.actions';
import * as Actions from './recipes.actions';
import { initialState, recipesReducer } from './recipes.reducer';

describe('Recipes Reducer', () => {
  describe('LOAD', () => {
    it('should load recipe settings', () => {
      const result = recipesReducer(
        undefined,
        App.load({
          partial: {
            recipesState: Mocks.RecipesState,
          },
        }),
      );
      expect(result).toEqual(Mocks.RecipesState);
    });

    it('should handle missing partial state', () => {
      const result = recipesReducer(undefined, App.load({ partial: {} }));
      expect(result).toEqual(initialState);
    });
  });

  describe('RESET', () => {
    it('should return the initial state', () => {
      const result = recipesReducer(undefined, App.reset());
      expect(result).toEqual(initialState);
    });
  });

  describe('SET_MACHINE', () => {
    it('should set the machine', () => {
      const result = recipesReducer(
        initialState,
        Actions.setMachine({
          id: Mocks.Recipe1.id,
          value: Mocks.Item1.id,
          def: undefined,
        }),
      );
      expect(result[Mocks.Recipe1.id].machineId).toEqual(Mocks.Item1.id);
    });

    it('should reset all other recipe settings', () => {
      const result = recipesReducer(
        {
          ...initialState,
          ...{
            [Mocks.Recipe1.id]: {
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
        Actions.setMachine({
          id: Mocks.Recipe1.id,
          value: Mocks.Item1.id,
          def: undefined,
        }),
      );
      expect(result[Mocks.Recipe1.id]).toEqual({ machineId: Mocks.Item1.id });
    });
  });

  describe('SET_FUEL', () => {
    it('should set the fuel', () => {
      const result = recipesReducer(
        initialState,
        Actions.setFuel({
          id: Mocks.Recipe1.id,
          value: Mocks.Item1.id,
          def: undefined,
        }),
      );
      expect(result[Mocks.Recipe1.id].fuelId).toEqual(Mocks.Item1.id);
    });
  });

  describe('SET_MODULES', () => {
    it('should set the modules', () => {
      const value = [{ count: rational.one, id: ItemId.Module }];
      const result = recipesReducer(
        initialState,
        Actions.setModules({
          id: Mocks.Recipe1.id,
          value,
        }),
      );
      expect(result[Mocks.Recipe1.id].modules).toEqual(value);
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
        initialState,
        Actions.setBeacons({
          id: Mocks.Recipe1.id,
          value,
        }),
      );
      expect(result[Mocks.Recipe1.id].beacons).toEqual(value);
    });
  });

  describe('SET_OVERCLOCK', () => {
    it('should set the overclock', () => {
      const value = rational(200n);
      const result = recipesReducer(
        initialState,
        Actions.setOverclock({
          id: Mocks.Recipe1.id,
          value,
          def: rational(100n),
        }),
      );
      expect(result[Mocks.Recipe1.id].overclock).toEqual(value);
    });
  });

  describe('SET_COST', () => {
    it('should set the cost', () => {
      const result = recipesReducer(
        initialState,
        Actions.setCost({
          id: Mocks.Recipe1.id,
          value: rational(10n),
        }),
      );
      expect(result[Mocks.Recipe1.id].cost).toEqual(rational(10n));
    });
  });

  describe('RESET_RECIPE', () => {
    it('should reset a recipe', () => {
      const result = recipesReducer(
        initialState,
        Actions.resetRecipe({ id: Mocks.Recipe1.id }),
      );
      expect(result[Mocks.Recipe1.id]).toBeUndefined();
    });
  });

  describe('RESET_RECIPE_MACHINES', () => {
    it(`should reset a recipe's modules`, () => {
      spyOn(StoreUtility, 'resetFields');
      recipesReducer(
        undefined,
        Actions.resetRecipeMachines({ ids: [Mocks.Recipe1.id] }),
      );
      expect(StoreUtility.resetFields<RecipeSettings>).toHaveBeenCalledWith(
        {},
        ['fuelId', 'modules', 'beacons'],
        Mocks.Recipe1.id,
      );
    });
  });

  describe('RESET_MACHINE', () => {
    it('should call resetField', () => {
      spyOn(StoreUtility, 'resetFields');
      recipesReducer(undefined, Actions.resetMachines());
      expect(StoreUtility.resetFields<RecipeSettings>).toHaveBeenCalledWith(
        {},
        ['machineId', 'fuelId', 'overclock', 'modules', 'beacons'],
      );
    });
  });

  describe('RESET_BEACONS', () => {
    it('should call resetField', () => {
      spyOn(StoreUtility, 'resetField');
      recipesReducer(undefined, Actions.resetBeacons());
      expect(StoreUtility.resetField<RecipeSettings>).toHaveBeenCalledWith(
        {},
        'beacons',
      );
    });
  });

  describe('RESET_COST', () => {
    it('should call resetField', () => {
      spyOn(StoreUtility, 'resetField');
      recipesReducer(undefined, Actions.resetCost());
      expect(StoreUtility.resetField<RecipeSettings>).toHaveBeenCalledWith(
        {},
        'cost',
      );
    });
  });
});
